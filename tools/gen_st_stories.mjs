#!/usr/bin/env node
/**
 * STORYLINE (docs/consoles/STORYLINE.md) — writes WebXR/shared/st-stories-data.js: two or three short side
 * stories for every path (but Just Roam) and every parish or district map, chained from what exists:
 *
 *   - the teller is a GRIOT parish character standing on that map (npc-data.js, placed by npc.js's grSiteFor);
 *   - the one line is a line from that character's own pack, copied verbatim with its source;
 *   - the hand-off sends the learner to a real site of the map;
 *   - the choice has two branches, each ending at a real catalog station or a real lesson (the map's field
 *     lessons, BAYOU's parish lessons), each branch's practice line being that station's catalog tagline or
 *     that lesson's own first step — so both branches teach the safe practice the source already teaches;
 *   - a KREWE kiosk at the site, when the path counts it, joins the chain.
 *
 *     node tools/gen_st_stories.mjs          # write the module
 *     node tools/gen_st_stories.mjs --check  # exit 1 if the module on disk differs from a fresh generation
 *
 * Deterministic: no randomness, no dates. No new stations.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(W, p)).href);
const OUT = join(W, "shared", "st-stories-data.js");

const { ST_PATHS } = await imp("shared/st-paths.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const { GR_ROSTER } = await imp("shared/npc-data.js");
const { grSiteFor } = await imp("shared/npc.js");
const { PP_PROGRAMMES } = await imp("shared/passport-programmes.js");
const { BY_LESSONS } = await imp("shared/by-parish-lessons.js");
const { KW_KIOSKS } = await imp("shared/kw-play-data.js");
const { slResolveSite } = await imp("shared/sl-parish-play.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity", "catalog.json"), "utf8"));
const STATIONS = new Map(catalog.stations.map((s) => [s.id, s]));

const noDigits = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const chars = GR_ROSTER.filter((c) => c.world === "parish");

function poolOf(path) {
  const pool = new Set();
  for (const id of path.programmes) for (const s of PP_PROGRAMMES[id]?.stations ?? []) pool.add(s);
  return pool;
}

function stationEnd(id, why) {
  const st = STATIONS.get(id);
  return st ? { kind: "station", id, title: st.name, practice: noDigits(st.tagline), src: { station: id }, why } : null;
}

const stories = [];
const counts = {};
for (const path of ST_PATHS) {
  if (!path.prompts) continue;
  const pool = poolOf(path);
  const classroom = path.id === "k12" || path.id === "teachers";
  for (const map of NP_PARISHES) {
    const present = chars.map((c) => ({ c, site: grSiteFor(c, map.sites)?.raw ?? null })).filter((x) => x.site);
    const kiosksHere = KW_KIOSKS.filter((k) => k.parish === map.id && path.kiosks.includes(k.id))
      .map((k) => ({ k, site: slResolveSite(map, k.site)?.id ?? k.site }));
    const scored = map.sites.map((site, i) => {
      const fl = (map.fieldLessons ?? []).filter((l) => l.site === site.id);
      const by = BY_LESSONS.filter((l) => l.parish === map.id && l.site === site.id && STATIONS.has(l.station));
      const inPool = site.stations.filter((s) => pool.has(s) && STATIONS.has(s));
      const who = present.find((x) => x.site.id === site.id)?.c ?? null;
      const kiosk = kiosksHere.find((x) => x.site === site.id)?.k ?? null;
      let score = inPool.length * 2 + (path.siteKinds.includes(site.kind) ? 2 : 0) + (who && path.greeters.includes(who.id) ? 1 : 0) + (kiosk ? 1 : 0);
      if (classroom) score += fl.length * 3 + by.length * 3;
      return { site, i, fl, by, inPool, who, kiosk, score };
    }).filter((x) => (x.inPool.length || x.fl.length || x.by.length || x.site.stations.some((s) => STATIONS.has(s))))
      .sort((a, b) => b.score - a.score || a.i - b.i);
    const take = scored.slice(0, scored.length >= 3 && scored[2].score >= 3 ? 3 : 2);
    take.forEach((x, n) => {
      const id = `st-${path.id}-${map.id}-${n + 1}`;
      // The teller: the character at the site, else the nearest character on this map (who hands the learner on).
      let teller = x.who;
      if (!teller) {
        const near = present.slice().sort((a, b) => Math.hypot(a.site.position[0] - x.site.position[0], a.site.position[1] - x.site.position[1])
          - Math.hypot(b.site.position[0] - x.site.position[0], b.site.position[1] - x.site.position[1]) || a.c.id.localeCompare(b.c.id));
        const pref = near.find((p) => path.greeters.includes(p.c.id)) ?? near[0];
        teller = pref?.c ?? null;
      }
      if (!teller) return;
      const tellerSite = present.find((p) => p.c.id === teller.id)?.site ?? x.site;
      // The two ends.
      const stationIds = [...x.inPool, ...x.site.stations.filter((s) => STATIONS.has(s) && !x.inPool.includes(s))];
      const lessonEnds = [
        ...x.fl.map((l) => ({ kind: "lesson", id: l.id, title: l.title, practice: noDigits(l.steps?.[0]), src: { lesson: l.id }, k12: l.k12 })),
        ...x.by.map((l) => ({ kind: "lesson", id: l.id, title: l.title, practice: noDigits(l.steps?.[0]), src: { lesson: l.id }, k12: l.station })),
      ];
      let a, b;
      if (classroom && lessonEnds.length) {
        const le = lessonEnds[0];
        a = stationEnd(le.k12, "the classroom station") ?? stationEnd(stationIds[0], "the site's station");
        b = { ...le };
      } else {
        a = stationEnd(stationIds[0], "the site's station");
        b = lessonEnds[0] ?? stationEnd(stationIds[1] ?? stationIds[0], "a second station at the site");
      }
      if (!a || !b) return;
      delete b.k12;
      // The line: the teller's own pack line about a story station if there is one, else about any station, else the first.
      const ends = new Set([a.id, b.id, ...stationIds]);
      const line = teller.pack.find((l) => l.src?.station && ends.has(l.src.station)) ?? teller.pack.find((l) => l.src?.station) ?? teller.pack[0];
      const handoff = { kind: "site", parish: map.id, site: x.site.id, siteName: x.site.name, from: tellerSite.id };
      const chain = [{ kind: "character", id: teller.id }, { kind: "site", id: x.site.id }, { kind: a.kind, id: a.id }, { kind: b.kind, id: b.id }];
      if (x.kiosk) chain.push({ kind: "kiosk", id: x.kiosk.id });
      const kid = path.id === "k12";
      stories.push({
        id, path: path.id, parish: map.id, site: x.site.id, siteName: x.site.name,
        character: teller.id, characterName: teller.name, role: teller.role,
        line: { text: line.text, src: line.src },
        handoff,
        prompt: kid ? `${teller.name} waves you over: shall we try it with the crew, or learn it first?` : `${teller.name} sends you to ${x.site.name}. How do you start?`,
        branches: [
          { id: `${id}-a`, label: a.kind === "station" ? "Work it with the crew" : "Learn it first", end: { kind: a.kind, id: a.id }, title: a.title, practice: a.practice, src: a.src },
          { id: `${id}-b`, label: b.kind === "lesson" ? "Learn it first" : "Walk it with the crew lead", end: { kind: b.kind, id: b.id }, title: b.title, practice: b.practice, src: b.src },
        ],
        kiosk: x.kiosk?.id ?? null,
        chain,
      });
      counts[path.id] = (counts[path.id] ?? 0) + 1;
    });
  }
}

const body = `// GENERATED by tools/gen_st_stories.mjs — do not edit by hand (console STORYLINE, docs/consoles/STORYLINE.md).
// ${stories.length} side stories: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}.
// Every line is a GRIOT character's own sourced line, copied verbatim; every branch ends at a catalog station or a
// real lesson and carries that source's own practice line. Names prefixed st/ST_ (one bundle scope).

export const ST_STORIES = ${JSON.stringify(stories, null, 1)};
`;
if (process.argv.includes("--check")) {
  const cur = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (cur !== body) { console.log("st-stories-data.js is stale — run node tools/gen_st_stories.mjs"); process.exit(1); }
  console.log(`st-stories-data.js up to date: ${stories.length} stories`);
} else {
  writeFileSync(OUT, body);
  console.log(`wrote ${OUT.replace(ROOT + "/", "")}: ${stories.length} stories`, JSON.stringify(counts));
}
