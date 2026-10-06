/**
 * BAYOU — one Cognition.X-structure flow per New Orleans parish lesson (the SmartCiti.X side
 * of the flow contract only; docs/k12.md, docs/flowhub.md).
 *
 *     node tools/gen_by_flows.mjs
 *
 * Reads BY_LESSONS (WebXR/shared/by-parish-lessons.js) and writes WebXR/flows/by-<slug>.json:
 * pre-brief → the station (back to the brief until passed) → the check question (a check-in node
 * carrying `params.check`) → the hand-off to the two-minute apply step (an `external` node the
 * parishes app or by-flow-agent.js runs and resumes) → the closing check-in. flows/index.json
 * gains one row per flow. Idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { BY_LESSONS, byApplyFor } = await import("../WebXR/shared/by-parish-lessons.js");

const indexPath = join(ROOT, "WebXR/flows/index.json");
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const SHAPE = "pre-brief -> station -> check question -> hand-off to the parish apply step -> check-in";

for (const l of BY_LESSONS) {
  const fallback = byApplyFor(l, { kiosks: [] });
  const flow = {
    id: l.flow,
    title: `Parish Lesson — ${l.title}`,
    version: 1,
    start: "brief",
    meta: {
      audience: `A learner or a small group at the ${l.siteName}, ${l.band}.`,
      why: "One idea taught at a real parish site, checked with one question, then used straight away in a two-minute game in the parish.",
      hostNotes: "The SmartCiti.X side of the flow contract only (docs/flowhub.md, docs/k12.md): nothing here states how Cognition.X or any other host stores or presents it. The apply node is external: the parishes app or a GRIOT character (by-flow-agent.js) runs the step and posts the resume.",
      lowConnectivity: "Works offline once the page has loaded; the run waits in this browser's own storage.",
      bayou: { lesson: l.id, parish: l.parish, site: l.site, band: l.band, guide: l.guide },
    },
    nodes: [
      { id: "brief", kind: "brief", app: "smartcity", ref: l.station, title: `Pre-brief — ${l.title}`,
        why: "The station's own study card, read first, so the learner knows the one idea the lesson is for." },
      { id: "lesson", kind: "station", app: "smartcity", ref: l.station, title: l.title,
        why: "The K-12 station itself, launched from its parish site; a run that does not pass goes back to the brief." },
      { id: "check", kind: "checkin", app: "smartcity", title: `Check question — ${l.title}`,
        why: "One question on the idea just taught, answered before the game; a wrong answer shows the why and asks again. Never scored against anyone.",
        params: { check: l.check } },
      { id: "apply", kind: "external", app: "host", ref: l.apply.id, title: `Apply it in the parish — ${fallback?.game?.title ?? l.apply.id}`,
        why: "A two-minute game at the parish site that uses the idea just taught; the passport records the lesson and the game.",
        params: { parish: l.parish, site: l.site, minutes: l.minutes, fallback: l.apply.fallback ?? null } },
      { id: "close", kind: "checkin", app: "smartcity", title: "End-of-lesson check-in",
        why: "The lesson closes on the learner's own answer about how it went, not on a score." },
    ],
    edges: [
      { from: "brief", to: "lesson" },
      { from: "lesson", to: "check", when: { passed: true } },
      { from: "lesson", to: "brief" },
      { from: "check", to: "apply" },
      { from: "apply", to: "close" },
    ],
  };
  writeFileSync(join(ROOT, "WebXR/flows", `${l.flow}.json`), JSON.stringify(flow, null, 2) + "\n");
  const row = { id: flow.id, file: `${flow.id}.json`, title: flow.title, shape: SHAPE };
  const at = index.flows.findIndex((r) => r.id === flow.id);
  if (at >= 0) index.flows[at] = row; else index.flows.push(row);
}
writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
console.log(`gen_by_flows: ${BY_LESSONS.length} parish lesson flows written; flows/index.json lists ${index.flows.length}`);
