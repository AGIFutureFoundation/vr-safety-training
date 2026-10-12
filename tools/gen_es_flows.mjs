// ESTUARY — one Cognition.X-structure flow per Bay ecology lesson (WebXR/flows/es-*.json), generated from
// ES_LESSONS in WebXR/shared/es-bay-lessons.js, and listed in WebXR/flows/index.json. The SmartCiti.X side of
// the flow contract only (docs/flowhub.md). Idempotent.
//     node tools/gen_es_flows.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { ES_LESSONS, esApplyGame } = await import("../WebXR/shared/es-bay-lessons.js");
const idxPath = join(ROOT, "WebXR/flows/index.json");
const idx = JSON.parse(readFileSync(idxPath, "utf8"));
for (const l of ES_LESSONS) {
  const applyId = l.apply.id ?? l.apply.fallback;
  const g = esApplyGame(l.apply.fallback);
  const flow = {
    id: l.flow, title: `Bay Lesson — ${l.title}`, version: 1, start: "brief",
    meta: {
      audience: `A learner or a small group at the ${l.siteName}, ${l.band}.`,
      why: "One idea about the Bay taught at a mapped site, checked with one question, then used straight away in a two-minute game.",
      hostNotes: "The SmartCiti.X side of the flow contract only (docs/flowhub.md, docs/k12.md): nothing here states how Cognition.X or any other host stores or presents it. The apply node is external: the host runs BAYQUEST's game when present, else ESTUARY's fallback, and posts the resume.",
      lowConnectivity: "Works offline once the page has loaded; the run waits in this browser's own storage.",
      estuary: { lesson: l.id, district: l.district, site: l.site, band: l.band, oakland: l.oakland ?? null },
    },
    nodes: [
      { id: "brief", kind: "brief", app: "smartcity", ref: l.station, title: `Pre-brief — ${l.title}`, why: "The station's own study card, read first, so the learner knows the one idea the lesson is for." },
      { id: "lesson", kind: "station", app: "smartcity", ref: l.station, title: l.title, why: "The K-12 station itself, launched from its mapped site; a run that does not pass goes back to the brief." },
      { id: "check", kind: "checkin", app: "smartcity", title: `Check question — ${l.title}`, why: "One question on the idea just taught, answered before the game; a wrong answer shows the why and asks again. Never scored against anyone.", params: { check: l.check } },
      { id: "apply", kind: "external", app: "host", ref: applyId, title: `Apply it — ${g?.title ?? applyId}`, why: "A two-minute game that uses the idea just taught; the passport records the lesson and the game.", params: { district: l.district, site: l.site, minutes: l.minutes, fallback: l.apply.id ? l.apply.fallback : null } },
      { id: "close", kind: "checkin", app: "smartcity", title: "End-of-lesson check-in", why: "The lesson closes on the learner's own answer about how it went, not on a score." },
    ],
    edges: [
      { from: "brief", to: "lesson" }, { from: "lesson", to: "check", when: { passed: true } }, { from: "lesson", to: "brief" },
      { from: "check", to: "apply" }, { from: "apply", to: "close" },
    ],
  };
  writeFileSync(join(ROOT, `WebXR/flows/${l.flow}.json`), JSON.stringify(flow, null, 2) + "\n");
  const row = { id: l.flow, file: `${l.flow}.json`, title: flow.title, shape: "pre-brief -> station -> check question -> hand-off to the apply step (BAYQUEST game or ESTUARY fallback) -> check-in" };
  const at = idx.flows.findIndex((r) => r.id === l.flow);
  if (at >= 0) idx.flows[at] = row; else idx.flows.push(row);
}
writeFileSync(idxPath, JSON.stringify(idx, null, 2) + "\n");
console.log(`gen_es_flows: ${ES_LESSONS.length} flow(s) written and indexed`);
