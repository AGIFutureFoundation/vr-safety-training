// LA-COHORTS — one flow per LA-K12 Louisiana lesson (WebXR/flows/lk-*.json), generated from LK_LESSONS
// (WebXR/shared/lk-la-lessons.js) and LCO_APPLY_GAMES (WebXR/shared/lco-la-flows.js), and listed in
// WebXR/flows/index.json. The SmartCiti.X side of the flow contract only (docs/flowhub.md). Idempotent.
//     node tools/gen_lco_flows.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { LK_LESSONS } = await import("../WebXR/shared/lk-la-lessons.js");
const { lcoFlowFor, lcoGameFor } = await import("../WebXR/shared/lco-la-flows.js");
const idxPath = join(ROOT, "WebXR/flows/index.json");
const idx = JSON.parse(readFileSync(idxPath, "utf8"));
let n = 0;
for (const l of LK_LESSONS) {
  const id = lcoFlowFor(l);
  const g = lcoGameFor(l);
  const a = l.anchors[0];
  const flow = {
    id, title: `Louisiana Lesson — ${l.title}`, version: 1, start: "brief",
    meta: {
      audience: `A learner or a small group at a Louisiana map site, ${l.band}; a teacher or a union hall can run it with a class code.`,
      why: "One idea about the places the Louisiana maps show, taught at a mapped site, checked with one question, then used straight away in a two-minute game.",
      hostNotes: "The SmartCiti.X side of the flow contract only (docs/flowhub.md, docs/k12.md): nothing here states how Cognition.X or any other host stores or presents it. The apply node is external: the host runs LA-COHORTS' game (WebXR/shared/lco-la-flows.js) and posts the resume.",
      lowConnectivity: "Works offline once the page has loaded; the run waits in this browser's own storage.",
      lacohorts: { lesson: l.id, theme: l.theme, map: a.map, site: a.site, band: l.band, programme: l.programme, generated: "tools/gen_lco_flows.mjs" },
    },
    nodes: [
      { id: "brief", kind: "brief", app: "smartcity", ref: l.station, title: `Pre-brief — ${l.title}`, why: "The station's own study card, read first, so the learner knows the one idea the lesson is for." },
      { id: "lesson", kind: "station", app: "smartcity", ref: l.station, title: l.title, why: "The K-12 station itself, launched from its mapped site; a run that does not pass goes back to the brief." },
      { id: "check", kind: "checkin", app: "smartcity", title: `Check question — ${l.title}`, why: "One question on the idea just taught, answered before the game; a wrong answer shows the why and asks again. Never scored against anyone.", params: { check: l.check } },
      { id: "apply", kind: "external", app: "host", ref: g.id, title: `Apply it — ${g.title}`, why: "A two-minute game that uses the idea just taught; the passport records the lesson and the game.", params: { parish: g.parish, site: g.site, minutes: g.minutes, idea: g.idea } },
      { id: "close", kind: "checkin", app: "smartcity", title: "End-of-lesson check-in", why: "The lesson closes on the learner's own answer about how it went, not on a score." },
    ],
    edges: [
      { from: "brief", to: "lesson" }, { from: "lesson", to: "check", when: { passed: true } }, { from: "lesson", to: "brief" },
      { from: "check", to: "apply" }, { from: "apply", to: "close" },
    ],
  };
  writeFileSync(join(ROOT, `WebXR/flows/${id}.json`), JSON.stringify(flow, null, 2) + "\n");
  const row = { id, file: `${id}.json`, title: flow.title, shape: "pre-brief -> station -> check question -> hand-off to the two-minute apply game (LA-COHORTS) -> check-in" };
  const at = idx.flows.findIndex((r) => r.id === id);
  if (at >= 0) idx.flows[at] = row; else idx.flows.push(row);
  n++;
}
writeFileSync(idxPath, JSON.stringify(idx, null, 2) + "\n");
console.log(`gen_lco_flows: ${n} flow(s) written and indexed`);
