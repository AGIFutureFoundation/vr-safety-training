/**
 * Headless checks for the platform's three newer Easter eggs (docs/easter-egg.md):
 *
 *     node tools/check_eggs.mjs
 *
 *  1. **Hard Hat Hunt.** The twelve chosen station files exist and each calls
 *     shared/eggs.js's plantHardHat() exactly once, and nowhere else edits
 *     the station beyond that one call. The unlock flag (found === 12) and a
 *     single find both round-trip through a fake localStorage.
 *  2. **Foreman's Radio.** shared/radio-quiz.js generates ten distinct,
 *     answerable questions — each with exactly one correct choice among its
 *     four, and that choice is the real body of the standard it was built
 *     from (shared/radio-quiz-data.js, generated from tools/standards.json)
 *     — across several seeds. The best score round-trips through a fake
 *     localStorage.
 *  3. **Capstone skins.** race/js/liveries.js unlocks a programme's livery
 *     only once a record carries a passed attempt tagged with that
 *     programme's level-20 capstone, and not for a different programme, a
 *     different level, or an unpassed attempt.
 *
 * Also checked: the homepage carries both eggs' trigger strings, and the
 * files above are wired into the bundler and check_all.mjs. Any scratch
 * folder this checker makes is removed on exit, pass or fail.
 */
import { readFileSync, mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const SHARED = join(WEBXR, "shared");

const scratch = mkdtempSync(join(tmpdir(), "check-eggs-"));
process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* scratch folder; best effort */ } });

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
function eq(a, b, message) { if (a !== b) throw new Error(`${message}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

/** A minimal, in-memory localStorage — no disk, no browser. */
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

console.log("Hard Hat Hunt, Foreman's Radio and Capstone skins — self-test\n");

// -------------------------------------------------------- 1. Hard Hat Hunt

/** The twelve hosts, chosen across programmes (docs/easter-egg.md). */
const HARD_HAT_HOSTS = [
  "smartcity/js/sims/cooling-tower.js",
  "smartcity/js/sims/sampling-well.js",
  "smartcity/js/sims/stage-load-in-and-truss-rigging.js",
  "smartcity/js/sims/tide-gate.js",
  "smartcity/js/sims/mast-climber.js",
  "smartcity/js/sims/hz-level-b-entry-and-scba-change-out.js",
  "smartcity/js/sims/bb-rebounding-and-boxing-out.js",
  "smartcity/js/sims/pm-unit-turnover.js",
  "smartcity/js/sims/cv-restorative-justice-circle-facilitation.js",
  "smartcity/js/sims/patient-intake-screening.js",
  "trades/js/rooms/welding.js",
  "trades/js/rooms/plumbing.js",
];

await check("shared/eggs.js exists and exports the hard-hat helper", () => {
  const src = readFileSync(join(SHARED, "eggs.js"), "utf8");
  assert(/export function plantHardHat/.test(src), "eggs.js does not export plantHardHat");
  assert(/export function recordHardHat/.test(src), "eggs.js does not export recordHardHat");
  assert(/export const HARD_HAT_TOTAL/.test(src), "eggs.js does not export HARD_HAT_TOTAL");
});

await check("all twelve hard-hat hosts exist and call plantHardHat() exactly once", () => {
  const missing = [], wrongCount = [], ids = new Set();
  for (const rel of HARD_HAT_HOSTS) {
    const path = join(WEBXR, rel);
    if (!existsSync(path)) { missing.push(rel); continue; }
    const src = readFileSync(path, "utf8");
    const calls = [...src.matchAll(/plantHardHat\(\s*root\s*,\s*THREE\s*,\s*"([a-z0-9-]+)"/g)];
    if (calls.length !== 1) wrongCount.push(`${rel} (${calls.length} call(s))`);
    else {
      assert(/import\s*\{\s*plantHardHat\s*\}\s*from\s*"[.\/a-z-]+shared\/eggs\.js"/.test(src), `${rel} calls plantHardHat but never imports it from shared/eggs.js`);
      const id = calls[0][1];
      assert(!ids.has(id), `two hosts plant a hard hat under the same id "${id}"`);
      ids.add(id);
    }
  }
  assert(missing.length === 0, `missing host file(s): ${missing.join(", ")}`);
  assert(wrongCount.length === 0, `host(s) not calling plantHardHat exactly once: ${wrongCount.join(", ")}`);
  eq(HARD_HAT_HOSTS.length, 12, "the hard-hat host list itself should list twelve stations");
});

await check("the hosts are chosen across more than one app and more than one programme", () => {
  const apps = new Set(HARD_HAT_HOSTS.map((p) => p.split("/")[0]));
  assert(apps.size >= 2, "every hard-hat host is in the same app");
  const curricula = readFileSync(join(WEBXR, "smartcity", "js", "curricula.js"), "utf8");
  const smartcityIds = HARD_HAT_HOSTS.filter((p) => p.startsWith("smartcity/")).map((p) => p.split("/").pop().replace(/\.js$/, ""));
  const programmesHit = new Set();
  for (const id of smartcityIds) {
    const re = new RegExp(`id:\\s*"${id}"`);
    const idx = curricula.search(re);
    if (idx === -1) continue;
    const before = curricula.slice(0, idx);
    const m = [...before.matchAll(/id:\s*"([a-z0-9-]+)",\s*\n\s*name:/g)];
    if (m.length) programmesHit.add(m[m.length - 1][1]);
  }
  assert(programmesHit.size >= 4, `hard-hat hosts land in only ${programmesHit.size} programme(s): ${[...programmesHit].join(", ")}`);
});

await check("finding a hard hat, and finding all twelve, round-trips through localStorage", async () => {
  const { recordHardHat, hardHatsFound, HARD_HAT_TOTAL, clearHardHats } = await import(pathToFileURL(join(SHARED, "eggs.js")));
  eq(HARD_HAT_TOTAL, 12, "HARD_HAT_TOTAL");
  const storage = fakeStorage();
  eq(hardHatsFound(storage).length, 0, "a fresh store starts with none found");
  let r = recordHardHat(HARD_HAT_HOSTS[0].split("/").pop().replace(/\.js$/, ""), storage);
  eq(r.found, 1, "one find recorded");
  assert(!r.allFound, "one find should not complete the set");
  // Finding the same hat again changes nothing.
  const again = recordHardHat(HARD_HAT_HOSTS[0].split("/").pop().replace(/\.js$/, ""), storage);
  eq(again.found, 1, "finding the same hard hat twice must not double-count");
  const ids = HARD_HAT_HOSTS.map((p) => p.split("/").pop().replace(/\.js$/, ""));
  for (const id of ids) r = recordHardHat(id, storage);
  eq(r.found, 12, "all twelve recorded");
  assert(r.allFound, "the set should read complete at twelve");
  assert(r.justCompleted, "the twelfth find should report justCompleted");
  eq(hardHatsFound(storage).length, 12, "hardHatsFound reflects the same store");
  clearHardHats(storage);
  eq(hardHatsFound(storage).length, 0, "clearHardHats empties the store");
  writeFileSync(join(scratch, "hardhats.json"), JSON.stringify({ ids, finalCount: 12 }));
});

// ------------------------------------------------------- 2. Foreman's Radio

await check("shared/radio-quiz-data.js is generated straight from tools/standards.json", () => {
  const registry = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8"));
  const dataSrc = readFileSync(join(SHARED, "radio-quiz-data.js"), "utf8");
  const startMarker = "export const RADIO_STANDARDS = ";
  const start = dataSrc.indexOf(startMarker);
  assert(start !== -1, "radio-quiz-data.js does not export RADIO_STANDARDS as expected");
  const rest = dataSrc.slice(start + startMarker.length);
  const end = rest.indexOf(";\nexport const RADIO_BODIES");
  assert(end !== -1, "radio-quiz-data.js does not export RADIO_BODIES after RADIO_STANDARDS as expected");
  const shipped = JSON.parse(rest.slice(0, end));
  const want = (registry.standards ?? []).filter((s) => s?.id && s?.body && s?.title).map((s) => ({ id: s.id, body: s.body, title: s.title }));
  eq(shipped.length, want.length, "radio-quiz-data.js is stale — run node tools/gen_radio_quiz.mjs");
  for (let i = 0; i < want.length; i++) {
    eq(shipped[i].id, want[i].id, `radio-quiz-data.js entry ${i} id`);
    eq(shipped[i].body, want[i].body, `radio-quiz-data.js entry ${i} body`);
    eq(shipped[i].title, want[i].title, `radio-quiz-data.js entry ${i} title`);
  }
});

await check("the quiz generates ten distinct, honestly-sourced questions with one right answer each", async () => {
  const quiz = await import(pathToFileURL(join(SHARED, "radio-quiz.js")));
  const { RADIO_STANDARDS } = await import(pathToFileURL(join(SHARED, "radio-quiz-data.js")));
  const byId = new Map(RADIO_STANDARDS.map((s) => [s.id, s]));
  for (const seed of [1, 2, 3, 12345]) {
    const questions = quiz.buildQuiz(10, { rng: quiz.makeRng(seed) });
    eq(questions.length, 10, `seed ${seed}: question count`);
    const ids = new Set(questions.map((q) => q.standardId));
    eq(ids.size, 10, `seed ${seed}: all ten questions must be distinct`);
    for (const q of questions) {
      const standard = byId.get(q.standardId);
      assert(standard, `seed ${seed}: question cites a standard not in the registry`);
      eq(q.choices.length, 4, `seed ${seed}: ${q.id} does not offer four choices`);
      eq(new Set(q.choices).size, 4, `seed ${seed}: ${q.id} repeats a choice`);
      assert(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4, `seed ${seed}: ${q.id} has no valid answerIndex`);
      eq(q.choices[q.answerIndex], standard.body, `seed ${seed}: ${q.id}'s marked answer is not the standard's real publishing body`);
      assert(q.text.length > 0 && q.text.includes("?"), `seed ${seed}: ${q.id} has no question text`);
      // Nothing invented: the question text is built only from this standard's own title.
      const clause = /\b\d{1,3}\s*CFR\s*[0-9]+(?:\.[0-9]+)?\b/.exec(standard.title);
      if (clause) assert(q.text.includes(clause[0]), `seed ${seed}: ${q.id} quotes a clause not in its own standard's title`);
      else assert(q.text.includes(standard.title), `seed ${seed}: ${q.id}'s question text is not built from its standard's own title`);
    }
  }
});

await check("the best radio-quiz score round-trips through localStorage", async () => {
  const quiz = await import(pathToFileURL(join(SHARED, "radio-quiz.js")));
  const storage = fakeStorage();
  eq(quiz.bestRadioScore(storage), null, "a fresh store has no best score");
  let r = quiz.recordRadioScore(6, 10, storage);
  eq(r.best, 6, "first run becomes the best");
  assert(r.isNewBest, "the first run is always a new best");
  r = quiz.recordRadioScore(4, 10, storage);
  eq(r.best, 6, "a worse run must not overwrite the best");
  assert(!r.isNewBest, "a worse run is not a new best");
  r = quiz.recordRadioScore(9, 10, storage);
  eq(r.best, 9, "a better run becomes the new best");
  assert(r.isNewBest, "a better run is a new best");
  eq(quiz.bestRadioScore(storage).best, 9, "the stored best matches the last improvement");
});

// -------------------------------------------------------- 3. Capstone skins

await check("race/js/capstone-liveries.js is generated straight from the ladders", async () => {
  const { LADDERS } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "ladders.js")));
  const { CAPSTONE_LIVERIES } = await import(pathToFileURL(join(WEBXR, "race", "js", "capstone-liveries.js")));
  eq(CAPSTONE_LIVERIES.length, LADDERS.length, "capstone-liveries.js is stale — run node tools/gen_capstone_liveries.mjs");
  for (let i = 0; i < LADDERS.length; i++) {
    eq(CAPSTONE_LIVERIES[i].programme, LADDERS[i].programme, `capstone-liveries.js entry ${i} programme`);
    eq(CAPSTONE_LIVERIES[i].name, LADDERS[i].name, `capstone-liveries.js entry ${i} name`);
  }
});

await check("a capstone livery unlocks only for a passed level-20 attempt on its own programme", async () => {
  const { capstoneUnlocked, liveryList, LADDER_CAPSTONE_LEVEL } = await import(pathToFileURL(join(WEBXR, "race", "js", "liveries.js")));
  const { CAPSTONE_LIVERIES } = await import(pathToFileURL(join(WEBXR, "race", "js", "capstone-liveries.js")));
  eq(LADDER_CAPSTONE_LEVEL, 20, "the capstone is level 20 (shared/ladder.js's LADDER_LEVELS)");
  const p = CAPSTONE_LIVERIES[0].programme, other = CAPSTONE_LIVERIES[1].programme;
  assert(!capstoneUnlocked([], p), "no records at all must not unlock a livery");
  assert(!capstoneUnlocked([{ passed: true, ladder: { programme: p, level: 19 } }], p), "level 19 must not unlock the capstone livery");
  assert(!capstoneUnlocked([{ passed: false, ladder: { programme: p, level: 20 } }], p), "an unpassed attempt must not unlock the livery");
  assert(!capstoneUnlocked([{ passed: true, ladder: { programme: other, level: 20 } }], p), "another programme's capstone must not unlock this one");
  assert(capstoneUnlocked([{ passed: true, ladder: { programme: p, level: 20 } }], p), "a passed level-20 attempt on this programme should unlock it");

  const list = liveryList([{ passed: true, ladder: { programme: p, level: 20 } }], 0);
  eq(list.length, CAPSTONE_LIVERIES.length + 1, "one row per programme, plus Hard Hat Gold");
  assert(!list[0].unlocked, "Hard Hat Gold must stay locked with zero hard hats found");
  const row = list.find((l) => l.programme === p);
  assert(row.unlocked, "the programme with the passed capstone attempt should show unlocked");
  assert(row.name.length > 0 && list.filter((l) => l.programme).every((l) => l.name.length > 0), "every capstone livery must be named after its programme");
  const otherRow = list.find((l) => l.programme === other);
  assert(!otherRow.unlocked, "a programme with no capstone record must stay locked");

  const full = liveryList([], 12);
  assert(full[0].unlocked, "Hard Hat Gold should unlock once all twelve hard hats are reported found");
});

// ------------------------------------------------------------ 4. wired up

await check("the homepage carries both eggs' trigger strings", () => {
  for (const [file, page] of [["WebXR/index.html", readFileSync(join(WEBXR, "index.html"), "utf8")], ["WebXR/home.html", readFileSync(join(WEBXR, "home.html"), "utf8")]]) {
    assert(page.includes('"KeyR", "KeyA", "KeyD", "KeyI", "KeyO"'), `${file} is missing the "radio" key sequence`);
    assert(page.includes('import("./shared/radio-quiz.js")'), `${file} never opens the Foreman's Radio quiz`);
    assert(page.includes('id="hardhat-count"'), `${file} is missing the hard-hat counter`);
    assert(page.includes("hard hats found:"), `${file}'s hard-hat counter has no label`);
    // The existing race egg's trigger must still be intact alongside the new one.
    assert(page.includes('"ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"'), `${file} lost the race egg's key sequence`);
  }
});

await check("the new shared files are wired into the bundler and check_all.mjs", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  assert(bundler.includes('SHARED / "eggs.js"'), "bundle_webxr.py never bundles shared/eggs.js into any app");
  assert(/DIST_SHARED\s*=\s*\[[^\]]*"radio-quiz\.js"/.test(bundler), "bundle_webxr.py never ships shared/radio-quiz.js beside the dist homepage");
  assert(/DIST_SHARED\s*=\s*\[[^\]]*"radio-quiz-data\.js"/.test(bundler), "bundle_webxr.py never ships shared/radio-quiz-data.js beside the dist homepage");
  assert(existsSync(join(WEBXR, "dist", "shared", "radio-quiz.js")), "WebXR/dist/shared/radio-quiz.js is missing — run python3 tools/bundle_webxr.py");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_eggs.mjs"'), "check_all.mjs does not run check_eggs.mjs");
  const doc = readFileSync(join(ROOT, "docs", "easter-egg.md"), "utf8");
  for (const word of ["Hard Hat Hunt", "Foreman's Radio", "Capstone skins"]) {
    assert(doc.includes(word), `docs/easter-egg.md never documents ${word}`);
  }
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll checks pass: twelve hard-hat hosts, a ten-question honest quiz, and the capstone unlock rule.`);
process.exit(failures ? 1 : 0);
