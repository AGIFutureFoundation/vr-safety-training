// check_robot_language: the stations' procedure language as instruction data (tools/gen_robot_language.mjs).
//
//   node tools/check_robot_language.mjs
//
// Proves the files on disk are what the generator writes now; every catalog station is in the data set; every record
// quotes its station's export word for word (nothing generated); every record has the fields its type promises; the
// station table links each style to a robot-assist style that exists; and no record carries contact details, a URL or
// a learner's answer. Node only, no browser.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const G = await import(pathToFileURL(join(ROOT, "tools", "gen_robot_language.mjs")).href);
const R = await import(pathToFileURL(join(ROOT, "tools", "gen_ros_assist.mjs")).href);
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR", "smartcity", "catalog.json"), "utf8"));

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_robot_language: procedure language as instruction data");

const { index, byFile } = await G.buildRobotLanguage();

// 1 the files on disk are what the generator writes now, and no stray file is left
const read = (f) => (existsSync(join(G.RL_DIR, f)) ? readFileSync(join(G.RL_DIR, f), "utf8") : null);
check(read("index.json") === JSON.stringify(index, null, 2) + "\n", "index.json is current (run tools/gen_robot_language.mjs)");
const stale = Object.entries(byFile).filter(([f, recs]) => read(f) !== recs.map((r) => JSON.stringify(r)).join("\n") + "\n").map(([f]) => f);
check(stale.length === 0, `every category file is current${stale.length ? ` (${stale.join(", ")})` : ""}`);
const stray = readdirSync(G.RL_DIR).filter((f) => f !== "index.json" && !byFile[f]);
check(stray.length === 0, `no stray file in exports/robot-language${stray.length ? ` (${stray.join(", ")})` : ""}`);

// 2 every catalog station is in the data set
const ids = new Set(catalog.stations.map((s) => s.id));
const missing = [...ids].filter((id) => !index.stations[id]);
check(missing.length === 0 && index.counts.stations === ids.size, `every catalog station is in the data set (${index.counts.stations} of ${ids.size}${missing.length ? `; missing ${missing.slice(0, 3).join(", ")}` : ""})`);

// 3 every record quotes its station's export, word for word
const records = Object.values(byFile).flat();
const norm = (t) => (t ?? "").replace(/\s+/g, " ").trim();
const exp = new Map();
for (const f of readdirSync(G.RL_SOURCE).filter((x) => x.endsWith(".json"))) { const st = JSON.parse(readFileSync(join(G.RL_SOURCE, f), "utf8")); if (st.id) exp.set(st.id, st); }
const src = (id) => exp.get(id) ?? {};
const unquoted = records.filter((r) => {
  const st = src(r.station);
  if (r.type === "step") { const s = st.steps?.[r.index]; return !s || norm(s.cue ?? s.prompt) !== r.instruction || (s.why && norm(s.why) !== r.rationale); }
  if (r.type === "interrupt") { const it = (st.interrupts ?? []).find((x) => `${r.station}:interrupt:${x.id}` === r.id); return !it || norm(it.cue) !== r.instruction || norm(it.alert) !== (r.situation ?? ""); }
  if (r.type === "unsafe") return norm(st.hazards?.[r.unsafe_choice]) !== r.explanation;
  return true;
});
check(unquoted.length === 0, `every record quotes its station word for word (${records.length} records${unquoted.length ? `; ${unquoted.slice(0, 3).map((r) => r.id).join(", ")}` : ""})`);

// 4 every record has the fields its type promises, and ids are unique
const shape = { step: ["instruction", "action", "title"], interrupt: ["instruction", "situation"], unsafe: ["unsafe_choice", "explanation"] };
check(records.every((r) => shape[r.type] && shape[r.type].every((k) => r[k] != null && r[k] !== "")), "every record has the fields its type promises");
check(new Set(records.map((r) => r.id)).size === records.length, "record ids are unique");
check(index.counts.records === records.length && index.counts.step + index.counts.interrupt + index.counts.unsafe === records.length, "the index counts every record once");
check(index.counts.interrupt > 0 && index.counts.unsafe > 0, "the data set pairs instructions with stops and unsafe choices");

// 5 the station table links to robot-assist styles that exist, and robot stations are marked
const styles = new Set(Object.keys(R.ROS_ASSIST_STYLES));
check(Object.values(index.stations).every((m) => m.assist_style === null || styles.has(m.assist_style)), "every assist style is a robot-assist style that exists");
check(index.counts.robotStations > 0 && index.stations["rt-speed-separation-monitoring-setup"]?.robot === true, `robot-control stations are marked (${index.counts.robotStations})`);

// 6 no contact details, URL or learner data
const text = records.map((r) => JSON.stringify(r)).join("\n");
check(!/[\w.+-]+@[\w-]+\.[\w.]+|https?:\/\/|\(\d{3}\)\s?\d{3}-\d{4}/.test(text), "no email address, URL or phone number in any record");
check(index.learner_data === false && !records.some((r) => "answer" in r || "learner" in r || "user" in r), "no learner answer or learner field in any record");

// 7 deterministic
check(JSON.stringify(await G.buildRobotLanguage()) === JSON.stringify({ index, byFile }), "two builds give the same data set");

const c = index.counts;
console.log(`  · ${c.records} records from ${c.stations} stations: ${c.step} steps, ${c.interrupt} interrupts, ${c.unsafe} unsafe choices; ${c.robotStations} robot stations`);
console.log(`check_robot_language: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
