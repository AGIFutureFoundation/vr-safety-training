/**
 * Generates WebXR/smartcity/catalog.json — the machine-readable roster a
 * hosting platform, portal or metaverse fabric can index without loading
 * any app: every SmartCiti.X station and Trade Skills room with its
 * category, trade, real certification, badge, rank ladder, step count, and
 * the deep link and embed parameters that open it. Built from the real
 * modules (same headless harness as the checkers), so it cannot drift.
 *
 *     node tools/gen_catalog.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";

const OUT = join(WEBXR, "smartcity", "catalog.json");
const city = await loadSmartCity();
const trades = await loadTrades();

const common = (r) => ({
  id: r.id, name: r.name ?? r.title, title: r.title, tagline: r.tagline ?? null,
  category: r.category ?? null, domain: r.domain ?? null, trade: r.trade ?? null,
  union: r.union ?? null, certification: r.certification ?? null,
  accent: r.accentCss ?? null, parSeconds: r.parSeconds ?? null,
  steps: r.steps.length, hazards: Object.keys(r.hazards ?? {}).length,
  stepKinds: [...new Set(r.steps.map((s) => s.kind))],
  badge: r.badge ?? null,
});

const stations = city.ROOMS.map((r) => ({
  app: "smartcity", ...common(r), index: r.index ?? null, flat: !!r.flat,
  system: r.game?.system ?? null, currency: r.game?.currency ?? null, ranks: r.game?.ranks ?? [],
  awards: [...(r.game?.badges ?? []), ...(r.game?.challenges ?? [])].map((a) => ({ id: a.id, name: a.name, note: a.note })),
  sources: (r.dossier ?? []).flatMap((d) => [d.source, d.source2].filter(Boolean)),
  deepLink: `smartcity/index.html?sim=${r.id}`,
}));
const rooms = trades.ROOMS.map((r) => ({
  app: "trades", ...common(r), category: r.category ?? "Trade Skills Simulator",
  deepLink: `trades/index.html?room=${r.id}`,
}));

const catalog = {
  protocol: 1,
  network: "SmartCiti.X ~VR Simulators (Powered by AGI Corp & Visko)",
  generatedAt: new Date().toISOString().slice(0, 10),
  apps: {
    smartcity: { entry: "smartcity/index.html", dist: "smartcity/dist/smartcity-x.html", modes: ["flat", "ar", "vr"], stations: stations.length },
    trades: { entry: "trades/index.html", dist: "trades/dist/trade-skills-simulator.html", modes: ["flat", "vr"], rooms: rooms.length },
    holodeck: { entry: "holodeck/index.html", dist: "holodeck/dist/holodeck.html", modes: ["flat", "vr"], note: "prompt-generated procedures; can load any SmartCiti.X station by name" },
    portal: { entry: "portal/index.html" },
  },
  categories: [...new Set([...stations, ...rooms].map((s) => s.category))].map((c) => ({
    name: c, stations: [...stations, ...rooms].filter((s) => s.category === c).map((s) => s.id),
  })),
  launch: {
    identity: "?learner=<name>&learner_id=<id>&learner_home=<https origin>  or  postMessage({type:'smartcitix:identity', learner, learner_id, learner_home})",
    lrs: "?lrs_endpoint=<https url>  or  postMessage({type:'smartcitix:lrs', endpoint, auth})",
    robot: "?robot=<skill 0..1>  runs a software trainee (SmartCiti.X)",
    commands: ["smartcitix:open {sim|room, skipBrief?}", "smartcitix:hub", "smartcitix:status", "smartcitix:catalog"],
    events: ["smartcitix:ready", "smartcitix:state", "smartcitix:catalog", "smartcitix:progress", "smartcitix:record", "smartcitix:credential"],
    trust: "commands are accepted, and events sent, only to the origin given as learner_home",
  },
  profile: { levels: 33, tiers: ["Trainee", "Apprentice", "Journeyworker", "Technician", "Specialist", "Foreman", "Master", "Certified Master", "Legend"], shared: ["smartcity", "trades", "holodeck"] },
  records: { formats: ["csv", "xapi-1.0.3", "open-badges-2.0"], passRule: "stars >= 2 and no unsafe action" },
  stations: [...stations, ...rooms],
};
writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Wrote ${OUT.replace(ROOT + "/", "")} (${stations.length} stations, ${rooms.length} rooms, ${catalog.categories.length} categories)`);
