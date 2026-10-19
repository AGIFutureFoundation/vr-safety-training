#!/usr/bin/env node
/**
 * Build the whitepaper page, WebXR/whitepaper.html, from the wiki and the committed console notes
 * (console SEO-WHITEPAPER-2). Never edit the page by hand: edit this file and run it.
 *
 *     node tools/gen_whitepaper_page.mjs           write the page
 *     node tools/gen_whitepaper_page.mjs --check   exit 1 if the committed page is not what this builds
 *
 * Then `python3 tools/bundle_webxr.py` (or a copy to WebXR/dist/whitepaper.html) and `node tools/gen_seo.mjs`
 * publish it; `node tools/check_whitepaper_page.mjs` holds it.
 *
 * Where each part comes from:
 *  - the SEO block: gen_seo.mjs's own wfBlock for the page, so gen_seo re-stamps it unchanged;
 *  - the section kickers: WF_WHITEPAPER.sections in gen_seo.mjs (the TechArticle's articleSection), one per <h2>;
 *  - the hand-read claims (the opening, the problem, the platform, the stack): copied from their files and read
 *    against them by the console that wrote them; each cites its file;
 *  - every other claim: a bullet of a wiki page in docs/wiki/ (built from the whitepaper fragments), copied
 *    verbatim, citing the files the bullet names and the wiki page itself;
 *  - the loop-ten tables: the "Measured, loop by loop" table of docs/wiki/Roadmap-and-Changelog.md, one row
 *    per console, grouped by round, with the files each row names; plus rows read from committed notes that
 *    the wiki table does not carry (SWP_EXTRA_ROWS).
 * A bullet or row that cannot be found stops the build with its name: nothing is filled in.
 * The output carries no date, so a re-run on the same tree is byte-identical.
 *
 * New top-level names carry the `swp` prefix.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { wfBlock, wfPages, wfStamp, WF_WHITEPAPER } from "./gen_seo.mjs";

const SWP_GEN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SWP_GEN_OUT = "WebXR/whitepaper.html";
const SWP_GEN_BLOB = "https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/";
const SWP_ROUNDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
// The round-11 whitepaper fragments number the rounds ("round 8"); earlier ones spelled them ("round seven").
const SWP_ROUND_WORD = (r) => (/^\d+$/.test(r) ? SWP_ROUNDS[Number(r) - 1] ?? r : r);

const swpEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Inline Markdown to HTML: links keep their text, `code` and **bold** keep their markup; licence identifiers are names (code). */
function swpInline(md) {
  return swpEsc(md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/(?<!`)\b(CC0-1\.0|CC-BY-4\.0|Apache-2\.0)\b(?!`)/g, "`$1`"))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, "$1<i>$2</i>");
}
const swpIsFile = (p) => { const f = join(SWP_GEN_ROOT, p); return existsSync(f) && statSync(f).isFile(); };
const swpCites = (paths) => [...new Set(paths)].filter(swpIsFile).map((p) => `<cite><a href="${SWP_GEN_BLOB}${p}">${p}</a></cite>`).join(" ");
const swpWikiCache = new Map();
function swpWiki(page) {
  if (!swpWikiCache.has(page)) swpWikiCache.set(page, readFileSync(join(SWP_GEN_ROOT, "docs/wiki", page), "utf8"));
  return swpWikiCache.get(page);
}
/** A bullet's body and the repository paths it ends with (`path` `path` or `path` and its commits and `path`). */
function swpSplit(text) {
  const tail = text.match(/(?:\s+(?:and its commits and\s+|and\s+)?`[\w./-]+\.[a-z]+`|\s+`[\w./-]+\/`)+\s*$/);
  if (!tail) return { body: text.trim(), paths: [] };
  return { body: text.slice(0, tail.index).trim(), paths: [...tail[0].matchAll(/`([^`]+)`/g)].map((m) => m[1]) };
}
/** The one bullet of a wiki page whose text starts with `prefix` (after any **Built** or *Planned* tag). */
function swpBullet(page, prefix, notes = []) {
  const hits = swpWiki(page).split("\n").filter((l) => l.startsWith("- ") && l.slice(2).replace(/^\*\*Built\*\*\s+|^\*Planned\*\s+/, "").startsWith(prefix));
  if (hits.length !== 1) throw new Error(`gen_whitepaper_page: ${hits.length} bullets in docs/wiki/${page} start with "${prefix}"`);
  const { body, paths } = swpSplit(hits[0].slice(2).replace(/^\*\*Built\*\*\s+|^\*Planned\*\s+/, ""));
  return { html: swpInline(body), cites: [...paths, ...notes, `docs/wiki/${page}`] };
}
/** Every headline bullet (one that names its file) under a page's `## heading`. */
function swpHeadline(page, heading) {
  const lines = swpWiki(page).split("\n");
  const at = lines.indexOf(`## ${heading}`);
  if (at < 0) throw new Error(`gen_whitepaper_page: no "## ${heading}" in docs/wiki/${page}`);
  const out = [];
  for (const l of lines.slice(at + 1)) {
    if (l.startsWith("## ")) break;
    if (!l.startsWith("- ")) continue;
    const { body, paths } = swpSplit(l.slice(2));
    if (paths.length) out.push({ html: swpInline(body), cites: [...paths, `docs/wiki/${page}`] });
  }
  if (!out.length) throw new Error(`gen_whitepaper_page: no sourced bullet under "## ${heading}" in docs/wiki/${page}`);
  return out;
}
/** The items of a list that follows a `### heading` (e.g. the summary's "Planned, not built"). */
function swpList(page, heading) {
  const lines = swpWiki(page).split("\n");
  const at = lines.indexOf(`### ${heading}`);
  if (at < 0) throw new Error(`gen_whitepaper_page: no "### ${heading}" in docs/wiki/${page}`);
  const out = [];
  for (const l of lines.slice(at + 1)) {
    if (/^#{1,3} /.test(l)) break;
    if (l.startsWith("- ")) out.push(l.slice(2).replace(/^\*\*Built\*\*\s+|^\*Planned\*\s+/, ""));
    else if (out.length && l.trim()) break;
  }
  return out;
}
/**
 * The committed primary file behind a wiki bullet that names none (the console note or doc the bullet was written from),
 * by the bullet's first words. It is cited before the wiki page, so a reader has the file the wiki summarised. A wiki
 * bullet with no entry here and no file of its own stops the build: a claim never cites only docs/wiki/.
 */
const SWP_PRIMARY = [
  ["351 episodes in the trainable set", ["docs/consoles/ROBO-ARENA.md"]],
  ["A measured study with real, opted-in adults", ["docs/consoles/COLEARN.md", "docs/consoles/ROBOTRAIN-5.md"]],
  ["A measured study of how learners use the hive", ["docs/consoles/HIVE-IN-WORLD.md", "docs/omega-hive.md"]],
  ["A native speaker’s review of the hive’s Spanish", ["docs/consoles/HIVE-3.md"]],
  ["A rated robot run that carries a signal", ["docs/consoles/ROBOTRAIN-7.md", "docs/consoles/ROBOTRAIN-8.md"]],
  ["The agents’ mouths against a real on-device voice", ["docs/consoles/AVATARS-HD.md"]],
  ["A headset session on hardware for the teleoperation pad", ["docs/consoles/ROBOTRAIN-2.md", "docs/consoles/ROBOTRAIN-3.md"]],
  ["A bench pilot", ["docs/bench-protocol.md"]],
  ["Virtuals Protocol", ["docs/virtuals-bridge.md", "docs/agent-roadmap.md"]],
];
const swpIsWiki = (p) => p.startsWith("docs/wiki/");
/** A claim's cites with its primary file first; throws when every cite would be a wiki page. */
function swpNoteFirst(text, cites) {
  const plain = text.replace(/<[^>]+>/g, "").replace(/^\s*(Built|Planned)\s+/, "").trim();
  const hit = SWP_PRIMARY.find(([lead]) => plain.startsWith(lead));
  const all = [...(hit ? hit[1] : []), ...cites].filter(swpIsFile);
  if (!all.some((p) => !swpIsWiki(p))) throw new Error(`gen_whitepaper_page: "${plain.slice(0, 60)}" would cite only docs/wiki/ (add its primary file to SWP_PRIMARY)`);
  return [...all.filter((p) => !swpIsWiki(p)), ...all.filter(swpIsWiki)];
}
const swpClaimList = (claims) => `      <ul class="swp-claims">\n${claims.map((c) => `        <li class="swp-claim">${c.html} ${swpCites(swpNoteFirst(c.html, c.cites))}</li>`).join("\n")}\n      </ul>`;

/** The loop-ten rows of the wiki's measured table, one per console, by round. */
function swpLoopTen() {
  const lines = swpWiki("Roadmap-and-Changelog.md").split("\n");
  const at = lines.indexOf("## Measured, loop by loop");
  if (at < 0) throw new Error("gen_whitepaper_page: no measured table in docs/wiki/Roadmap-and-Changelog.md");
  const groups = [];
  let cur = null;
  for (const l of lines.slice(at + 1)) {
    if (l.startsWith("## ")) break;
    if (!l.startsWith("| ") || l.startsWith("| Measure ") || l.startsWith("|---")) continue;
    const head = l.match(/^\| \*\*(.+?)\*\* \|/);
    if (head) {
      const m = head[1].match(/^Loop 10(?:, round (\w+))?: `([^`]+)`, (.+)$/);
      cur = m ? { round: SWP_ROUND_WORD(m[1] ?? "one"), name: m[2], title: m[3].replace(/\s*\([^()]*\)$/, ""), rows: [], paths: [] } : null;
      if (cur) groups.push(cur);
      continue;
    }
    if (!cur) continue;
    const cells = l.replace(/^\|\s*/, "").replace(/\s*\|\s*$/, "").split(/\s+\|\s+/);
    if (cells.length < 3) continue;
    // Pair each measure with its figure when the row lists them in step ("a; b: 1; 2" reads "a: 1; b: 2").
    const ms = cells[0].split(/;\s+/), fs = cells[1].split(/;\s+/);
    cur.rows.push(ms.length > 1 && ms.length === fs.length ? ms.map((m, i) => `${swpInline(m)}: ${swpInline(fs[i])}`).join("; ") : `${swpInline(cells[0])}: ${swpInline(cells[1])}`);
    cur.paths.push(...[...cells[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]));
  }
  return groups;
}
/** Rows from committed notes that the wiki's table does not carry; each copied from the files it cites. */
const SWP_EXTRA_ROWS = [
  { round: "six", name: "SEO-WHITEPAPER", title: "the whitepaper as a shareable page of the site",
    rows: ["Public pages in the sitemap: 79 → 80", "Whitepaper sections on the site, each with sources: 0 → 9 of 9", "Figures on the page present in the committed files they cite: 220 of 220 (69 claims)"],
    paths: ["docs/consoles/SEO-WHITEPAPER.md"] },
  { round: "seven", name: "CI", title: "two fixes found between rounds",
    rows: ["GitHub checks out one commit by default, so <code>check_arena</code> and <code>check_claw</code>, which prove a protocol was committed before its results, failed there (reproduced in a depth-1 clone): the workflow now fetches full history",
      "The runner's Python had no PyYAML, which <code>check_deploy_akamai</code> uses to read the workflows: the workflow installs it"],
    paths: ["docs/consoles/COORDINATOR.md", ".github/workflows/webxr-checks.yml"] },
];
/** Notes the wiki's table row cannot carry, set beside a console's row (copied from the wiki's own pages). */
const SWP_ROW_NOTES = {
  STRANDS: { html: "Simulated only: the package the asked-for sample imports, strands_harness, does not exist, so the harness is this project's own and says so.", paths: ["docs/wiki/Strands-Robots-Harness.md", "docs/consoles/STRANDS.md"] },
  ECOSYSTEM: { html: "Router.X is absent: no repository exists for it, and nothing is wired into either sibling repository.", paths: ["docs/wiki/Ecosystem.md", "docs/consoles/ECOSYSTEM.md"] },
};
function swpLoopTables() {
  const groups = [...swpLoopTen(), ...SWP_EXTRA_ROWS];
  const out = [];
  for (const round of SWP_ROUNDS) {
    const gs = groups.filter((g) => g.round === round);
    if (!gs.length) continue;
    out.push(`      <h3>Round ${round}</h3>`);
    out.push(`      <div class="swp-table"><table>`);
    out.push(`        <thead><tr><th scope="col">Console and feature</th><th scope="col">Measured</th><th scope="col">Source</th></tr></thead>`);
    out.push(`        <tbody>`);
    for (const g of gs) {
      const note = SWP_ROW_NOTES[g.name];
      const cells = [...g.rows, ...(note ? [note.html] : [])].map((r) => `<span class="swp-row">${r}</span>`).join(" ");
      const paths = [...g.paths, ...(note ? note.paths : []), ...(SWP_EXTRA_ROWS.includes(g) ? [] : ["docs/wiki/Roadmap-and-Changelog.md"])];
      out.push(`          <tr class="swp-claim"><td><code>${g.name}</code>, ${swpEsc(g.title)}</td><td>${cells}</td><td>${swpCites(paths)}</td></tr>`);
    }
    out.push(`        </tbody>`);
    out.push(`      </table></div>`);
  }
  const unknown = groups.filter((g) => !SWP_ROUNDS.includes(g.round));
  if (unknown.length) throw new Error(`gen_whitepaper_page: rounds not known: ${unknown.map((g) => g.round).join(", ")}`);
  return out.join("\n");
}

/** The sections, in reading order. Kickers come from WF_WHITEPAPER.sections, in the same order. */
const SWP_SECTION_DEFS = [
  { id: "problem", nav: "Problem", h2: "The dangerous moments need practice without the danger", parts: () => [
`      <p>People who work beside robots — apprentices, robot technicians, the specialists who collect and review demonstrations — need to practise the dangerous moments without the danger. The teams building robot and software-agent behaviour need demonstrations with the safety rules built in, gathered with consent. Today these are two separate efforts. This platform makes them one practice, with the teaching job first.</p>
      <ul class="swp-claims">
        <li class="swp-claim">Who it is for: apprentices and robot technicians who need robot-safety training; AI-training specialists who collect and review demonstrations; robotics and software-agent teams who want a gym with safety rules built in. No union, employer or robot maker is named as a partner, because there is none. ${swpCites(["docs/robotics-programme.md", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim">Every demonstration measured so far is synthetic or a labelled scripted stand-in; a measured study with real, opted-in adults is planned, not built. ${swpCites(["docs/consoles/ROBOTRAIN-5.md", "docs/consoles/COLEARN.md", "docs/wiki/Executive-Summary.md"])}</li>
      </ul>`,
  ] },
  { id: "platform", nav: "Platform", h2: "A training catalogue, a robot gym and a safety governor", parts: () => [
`      <p>A learner walks a city, opens a station and performs a scored procedure on a flat screen or in a headset. Robot stations sit inside the same catalogue. Behind them, a gym of simulated scenarios trains and scores robot policies, and a governor stands between every software agent and every simulated robot.</p>
      <ul class="swp-claims">
        <li class="swp-claim">742 stations in 61 programmes, scored by the platform's own content evaluation: mean 95.8 out of 100, 612 at 95 or more. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/investor/platform-summary.json">docs/investor/platform-summary.json</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Executive-Summary.md">docs/wiki/Executive-Summary.md</a></cite></li>
        <li class="swp-claim">Stations are taught against a registry of 513 standards, codes and programmes, named by title and never quoted. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/investor/platform-summary.json">docs/investor/platform-summary.json</a></cite></li>
        <li class="swp-claim">The learning loop runs in the app: demonstrate, consent, train, evaluate, and the robot demonstrates back (5 of 5 steps live). ${swpCites(["docs/robotics-programme.md", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim">A safety governor between software agents and simulated robots: e-stop first, 11 refusal reasons including a per-agent rate limit and a learned anomaly check that can only add a refusal, and a hash-chained audit log. ${swpCites(["docs/consoles/VBRIDGE.md", "docs/consoles/GOVERNOR-2.md", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim">Learner data stays in the browser it was made in; nothing leaves the device without the learner's explicit action. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/WebXR/privacy.html">WebXR/privacy.html</a></cite></li>
      </ul>`,
  ] },
  { id: "hive", nav: "Omega Hive", h2: "Software agents that manage the robots, and say they are software", parts: () => [
`      <p>The Omega Hive is the collective of software agents that coordinates every simulated robot job. Each agent has a persona, a style of speech, an on-device voice that is off until the learner turns it on, and a body that stands at the robot site it manages. The agents bid for jobs, hand them over, and ask the learner before anything that names the physical path. They are not a language model: every line is generated on the device from the agent's persona and the event's own data.</p>
      <ul class="swp-tiles" aria-label="Omega Hive figures">
        <li class="swp-tile swp-claim"><b>0.950</b><span>accuracy naming the speaking agent on 5,686 held-out lines; chance 0.143</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/OMEGA-HIVE.md">docs/consoles/OMEGA-HIVE.md</a></cite></li>
        <li class="swp-tile swp-claim"><b>13.715 → 0.034</b><span>mean steps from a job's announcement to its award: one dispatcher, then the hive</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/OMEGA-HIVE.md">docs/consoles/OMEGA-HIVE.md</a></cite></li>
        <li class="swp-tile swp-claim"><b>10 of 10</b><span>approval requests asked of the learner wherever the physical path is named</span> ${swpCites(["docs/consoles/OMEGA-HIVE.md", "docs/wiki/Roadmap-and-Changelog.md"])}</li>
      </ul>
      <ul class="swp-claims">
        <li class="swp-claim">The agents talk to each other at handoffs: 0 → 258 agent-to-agent exchanges in a seeded day, with 516 of 516 lines whose facts come from the award, the bid or the chain, and the governor still checking 161 of 161 jobs. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/HIVE-4.md">docs/consoles/HIVE-4.md</a></cite></li>
        <li class="swp-claim">They remember their own day from the hive's chain (36 of 36 memory references grounded), and a regressor recovers their traits from text on held-out personas: warmth 0.959, formality 0.832, verbosity 0.977, caution 0.799. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/HIVE-4.md">docs/consoles/HIVE-4.md</a></cite></li>
        <li class="swp-claim">“Supervise every job” on a seeded day: with no setting, 150 of 155 dispatches ran under the standing approval; with it on, dispatches without the learner's approval: 0 of 116. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/HIVE-IN-WORLD.md">docs/consoles/HIVE-IN-WORLD.md</a></cite></li>
        <li class="swp-claim">The hive operations room: 0 → 8 of 8 screens painted from the hive's own data, and 7 of 7 agents at their consoles. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/HIVE-5.md">docs/consoles/HIVE-5.md</a></cite></li>
      </ul>`,
    swpClaimList([
      swpBullet("Executive-Summary.md", "862 of 862 mood changes"),
      swpBullet("Roadmap-and-Changelog.md", "Moods reach the operations room", ["docs/consoles/HIVE-7.md"]),
    ]),
`      <p class="swp-note">Every agent avatar is labelled “software agent” and is visibly distinct from people. Voices are on-device only; captions always show; nothing listens. Virtuals Protocol appears only as a planned technology; nothing from it is installed, bundled or called. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/omega-hive.md">docs/omega-hive.md</a></cite></p>`,
  ] },
  { id: "buildings", nav: "Buildings", h2: "Six robot sites, inside and out", parts: () => [
`      <p>Each robot site has a building of its own, seen from the street, and a walk-in room behind its door where the station pads and the agents' spots are reached on foot. Everything is procedural — geometry from code, textures drawn on a canvas — and generic by kind: no real building's interior, no logo.</p>
      <ul class="swp-claims">
        <li class="swp-claim">Robot sites with a walk-in robotics room: 0 of 6 → 6 of 6; station pads and agent spots reachable on foot from the door: 70 of 70. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ROBO-INTERIORS.md">docs/consoles/ROBO-INTERIORS.md</a></cite></li>
        <li class="swp-claim">Robot sites with a dedicated exterior kit: 6 of 6, with texture bytes per map on the high tier measured at 5,941,931 against a budget of 6,291,456. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ROBO-EXTERIORS.md">docs/consoles/ROBO-EXTERIORS.md</a></cite></li>
        <li class="swp-claim">Sheds and towers within 150 m of a robot site with a robotics variant: 0 → 68 of 68. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ENV-HD-2.md">docs/consoles/ENV-HD-2.md</a></cite></li>
        <li class="swp-claim">Room styles with the high-detail texture set: 15 → 25, and the worst robot-site chunk on the high tier down from 6 to 5 meshes. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ENV-HD-3.md">docs/consoles/ENV-HD-3.md</a></cite></li>
        <li class="swp-claim">Six looks for the robot sites and 36 exterior presets; robot rooms with lighting 0 → 6 of 6; an opt-in Ultra setting for desktops draws facades at 2,048 px and stays off on phones, balanced and headsets. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ENV-HD-4.md">docs/consoles/ENV-HD-4.md</a></cite></li>
        <li class="swp-claim">Scene presets 18 → 26, reaching a park, a fire station, a hospital and a school, all generic by kind. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ENV-HD-5.md">docs/consoles/ENV-HD-5.md</a></cite></li>
      </ul>`,
    swpClaimList([
      swpBullet("Roadmap-and-Changelog.md", "The kind cues reach every site", ["docs/consoles/ENV-HD-7.md"]),
      swpBullet("Roadmap-and-Changelog.md", "The simulated robots in high detail on the desktop high tier (see", ["docs/consoles/ROBOTS-HD.md"]),
      swpBullet("Roadmap-and-Changelog.md", "The robots’ status light follows a live agent-jobs run", ["docs/consoles/ROBOTS-HD-2.md"]),
    ]),
  ] },
  { id: "bodies", nav: "Bodies", h2: "A figure that is plainly a machine, and plainly listening to its own words", parts: () => [
`      <p>On the desktop high tier each agent is a skinned software-agent figure — never a skin tone — whose posture follows its personality, whose mouth follows the words it speaks and whose hands answer the hive's own events. The phone tier and the balanced tier keep a lighter figure, so their budgets never change.</p>
      <ul class="swp-claims">
        <li class="swp-claim">Triangles per figure on the desktop high tier: 1,012 → 2,693 on average against a budget of 3,000; draw calls per figure while silent 9 → 3; distinct silhouettes among the 21 pairs of agents 18 of 21 → 21 of 21. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/AVATARS-HD.md">docs/consoles/AVATARS-HD.md</a></cite></li>
        <li class="swp-claim">The real voice controller now forwards each word boundary to the figure (0 → 20 in the checker), and the talk light waits for the voice to start: 11 of 11 spoken lines, against 0 of 11 without the wait. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/AVATARS-HD-2.md">docs/consoles/AVATARS-HD-2.md</a></cite></li>
        <li class="swp-claim">A crowd level for the operations room: 496–524 triangles a figure (≤ 540); seven figures and the room measure 46 meshes and 5,586 triangles against 6,000; walks crossing a console stay at 0 of 214. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/AVATARS-HD-3.md">docs/consoles/AVATARS-HD-3.md</a></cite></li>
        <li class="swp-claim">The mouth at a low frame rate: word boundaries stamped with their own time, 0 of 20 → 20 of 20 within 1 ms at 1 Hz frames. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/AVATARS-HD-3.md">docs/consoles/AVATARS-HD-3.md</a></cite></li>
        <li class="swp-claim">The 34 game characters each speak their own knowledge-pack lines in their own on-device voice: 136 of 136 spoken lines verbatim, and a network voice chosen 0 times. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/VOICES.md">docs/consoles/VOICES.md</a></cite></li>
      </ul>`,
    swpClaimList([
      swpBullet("Roadmap-and-Changelog.md", "The console nearest the learner stands", ["docs/consoles/AVATARS-HD-4.md"]),
    ]),
`      <p class="swp-note">Every word-boundary figure comes from a stubbed speech engine; the agents' mouths against a real on-device voice are planned. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Executive-Summary.md">docs/wiki/Executive-Summary.md</a></cite></p>`,
  ] },
  { id: "learning", nav: "Robot learning", h2: "Held-out seeds, declared in advance, reported as they came out", parts: () => [
`      <p>Every robot-learning result here comes from the simulator, seeded runs and scripted or synthetic demonstrations. Each retest was declared before its held-out seeds were run, and results that did not beat the plain rule are reported as they are.</p>
      <ul class="swp-claims">
        <li class="swp-claim">The safety governor blocked 200 of 200 seeded unsafe agent jobs, each for the intended reason, and wrongly blocked 0 of 200 safe jobs. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/VBRIDGE.md">docs/consoles/VBRIDGE.md</a></cite></li>
        <li class="swp-claim">Its learned check caught 66 of 100 rule-legal anomalous jobs that the rules alone passed, with 0 of 200 held-out safe jobs wrongly refused. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/GOVERNOR-2.md">docs/consoles/GOVERNOR-2.md</a></cite></li>
        <li class="swp-claim">On the hard fleet-routing variant, the gap to the scripted expert went from 0.583 to 0.017 after 5 rounds of corrections with features that read the other robots; the expert's labels are not a person's. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/evals/colearn.json">docs/evals/colearn.json</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Roadmap-and-Changelog.md">docs/wiki/Roadmap-and-Changelog.md</a></cite></li>
        <li class="swp-claim">A reactive agent that waits, then sidesteps, passes 55 of 60 fresh held-out seeds where the earlier one passed 26 of 60 — no search, no planner, no learning. On the same seeds a clone given no planner output ends a gap of 0.683, and a reward for steps still trails the plain rule filter (0.517 against 0.650). <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ROBOTRAIN-8.md">docs/consoles/ROBOTRAIN-8.md</a></cite></li>
        <li class="swp-claim">The best text-reading software agent passes 11.5% of 721 stations, against 100% for a scripted expert that sees the targets. ${swpCites(["docs/perf/agent-baselines.json", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim">Labelled synthetic datasets ship with a dataset card in the LeRobot-style and RLDS-style layouts, licence <code>CC0-1.0</code>. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/robot-datasets.md">docs/robot-datasets.md</a></cite></li>
      </ul>`,
  ] },
  { id: "arena", nav: "Arena and claw", h2: "Model against model, declared first and run once", parts: () => [
    `      <p>An arena runs the platform's model families on the same scenarios and held-out seeds through the governor, with intervals. The Omega Claw's software agents declare each comparison, run it once, audit it, and promote a model or refuse it with a reason. A model that did not beat the clone is reported as measured.</p>`,
    swpClaimList([
      ...swpHeadline("Robot-Arena.md", "Robots compete: model against model"),
      swpBullet("Roadmap-and-Changelog.md", "The arena’s retest was declared first", ["docs/consoles/ARENA-2.md"]),
      ...swpHeadline("Omega-Claw.md", "The agents that run robot training and model testing"),
      swpBullet("Roadmap-and-Changelog.md", "The claw’s second protocol was declared", ["docs/consoles/CLAW-2.md"]),
    ]),
  ] },
  { id: "strands", nav: "Strands harness", h2: "A Python harness on the strands-robots interface, simulated only", parts: () => [
    `      <p>This project's own Python harness speaks the interface of the open strands-robots library: a tool that wraps a robot, and policies that return actions for an observation and an instruction. The robot is always simulated, every step goes through the safety governor, and no real robot moves. It is not affiliated with that library's authors.</p>`,
    swpClaimList([
      ...swpHeadline("Strands-Robots-Harness.md", "A Python harness on the strands-robots interface"),
      swpBullet("Roadmap-and-Changelog.md", "The Strands harness’s one declared held-out comparison", ["docs/consoles/STRANDS.md"]),
      swpBullet("Strands-Robots-Harness.md", "**No such package.**", ["docs/consoles/STRANDS.md"]),
      swpBullet("Strands-Robots-Harness.md", "**Simulated only.**", ["docs/consoles/STRANDS.md"]),
    ]),
  ] },
  { id: "ecosystem", nav: "Ecosystem", h2: "Where the platform meets its sibling repositories", parts: () => [
    `      <p>SmartCiti.X and Cognition.X are sibling repositories under the same organisation. They were read at a named commit, read-only: the seams are written down, and nothing is wired into either. No partnership or endorsement is implied, and Router.X has no repository at all.</p>`,
    swpClaimList([
      ...swpHeadline("Ecosystem.md", "Where the platform meets SmartCiti.X and Cognition.X"),
      swpBullet("Ecosystem.md", "**Documented, mostly not wired.**", ["docs/consoles/ECOSYSTEM.md"]),
      swpBullet("Ecosystem.md", "**Router.X is absent.**", ["docs/consoles/ECOSYSTEM.md"]),
    ]),
  ] },
  { id: "loop10", nav: "Loop ten", h2: "Agents with faces, voices and personalities; robot buildings inside and out", parts: () => [
    `      <p>Loop ten gave the robots' software agents a hive, gave the six robot sites real buildings, and closed the roadmap's next robot-learning items with measured results. It ran in rounds; each console committed a note with its own before-and-after table. The rows below are the wiki's measured table, one row per console, each citing the files it names.</p>`,
    // The clip and poster are addressed as the published layout serves them (./media/, copied by the bundler from
    // WebXR/home/media/); in the repository layout the same files sit under home/media/. Accepted, and the checker says so.
    `      <figure class="swp-video">
        <video controls muted playsinline preload="none" poster="./${WF_WHITEPAPER.video.poster}" width="960" height="540" aria-label="${swpEsc(WF_WHITEPAPER.video.name)}">
          <source src="./${WF_WHITEPAPER.video.file}" type="video/mp4">
        </video>
        <figcaption>A short cut from the loop-ten video review, real captures with no sound: the hive's software agents at their morning briefing in the operations room, then the robot arena's leaderboard.</figcaption>
      </figure>`,
    swpLoopTables(),
  ] },
  { id: "stack", nav: "Stack", h2: "Static files, a flat bundle, and a gate that runs before anything ships", parts: () => [
`      <div class="swp-table"><table>
        <thead><tr><th scope="col">Layer</th><th scope="col">What it is</th><th scope="col">Source</th></tr></thead>
        <tbody>
          <tr class="swp-claim"><td>WebXR and three.js</td><td>Every world is a WebXR page rendered with three.js, vendored with its licence, so a page runs on a flat screen, a phone or a headset from static files.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/WebXR/vendor/three/LICENSE">WebXR/vendor/three/LICENSE</a></cite></td></tr>
          <tr class="swp-claim"><td>The flat bundler</td><td>One script inlines each app's ES modules and the shared engine into a distributable HTML file, publishes every app beside the homepage in one flat folder, and lets SmartCiti.X lazy-load its station sims; a gatekeeper checker proves every module calls only what it declares or imports.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/tools/bundle_webxr.py">tools/bundle_webxr.py</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/tools/check_imports.mjs">tools/check_imports.mjs</a></cite></td></tr>
          <tr class="swp-claim"><td>On-device speech</td><td>Only a speech-synthesis voice whose <code>localService</code> is true is ever used; a network voice is never chosen. Voice is off until the learner turns it on, and captions always show.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/WebXR/shared/oh-voice.js">WebXR/shared/oh-voice.js</a></cite></td></tr>
          <tr class="swp-claim"><td>The checker suite and gate</td><td>One command runs every headless checker and reports one line each: the parse and import gatekeepers first, then the rest in a pool that respects the shared machine's load.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/tools/check_all.mjs">tools/check_all.mjs</a></cite></td></tr>
          <tr class="swp-claim"><td>CI</td><td>The WebXR checks workflow runs the whole gate on every push and pull request that touches the WebXR apps or the tools, and fails a stale committed bundle. It checks out the full history, so the checks that prove a protocol was declared before its run can see their commits, and installs PyYAML for the checker that reads the workflow files.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/.github/workflows/webxr-checks.yml">.github/workflows/webxr-checks.yml</a></cite></td></tr>
          <tr class="swp-claim"><td>Deploy configs</td><td>The flat build deploys as static files: a Pages config, an API router, generated header and redirect rules, and a deploy agent that runs build, gate, deploy, verify and rollback, as a dry run by default with credentials only from the environment. The deploy workflow is gated on its secrets being present.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/deploy-cloudflare.md">docs/deploy-cloudflare.md</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/wrangler.toml">wrangler.toml</a></cite></td></tr>
          <tr class="swp-claim"><td>Data formats</td><td>Training records export as CSV, xAPI, Open Badges and a printed transcript; robot episodes export in LeRobot-style and RLDS-style layouts with a dataset card.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/WebXR/privacy.html">WebXR/privacy.html</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/robot-datasets.md">docs/robot-datasets.md</a></cite></td></tr>
          <tr class="swp-claim"><td>Search and share metadata</td><td>One generator stamps every page's title, description, canonical link, Open Graph and Twitter tags and JSON-LD, and writes the sitemap — this page included.</td><td><cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/tools/gen_seo.mjs">tools/gen_seo.mjs</a></cite></td></tr>
        </tbody>
      </table></div>`,
  ] },
  { id: "roadmap", nav: "Roadmap", h2: "What is built, and what is only planned", parts: () => [
    `      <ul class="swp-claims">`,
`        <li class="swp-claim"><span class="swp-tag built">Built</span> A robot gym: 6 simulated scenarios, scripted experts and a behaviour-cloning learner, scored on held-out seeds beside a random floor. ${swpCites(["docs/robot-training.md", "docs/consoles/COLEARN.md", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim"><span class="swp-tag built">Built</span> Consent, dataset cards and lineage: a revoke marks dependent policies stale, and the registry moves between devices as a file whose tampering is refused by name. ${swpCites(["docs/robotics-programme.md", "docs/robot-datasets.md", "docs/wiki/Executive-Summary.md"])}</li>
        <li class="swp-claim"><span class="swp-tag built">Built</span> A pilot kit: 30 cohort templates, the instructor console, the consent flow with its draft terms, and a bench protocol that is a method (0 hardware runs). ${swpCites(["docs/instructor-console.md", "docs/bench-protocol.md", "docs/wiki/Executive-Summary.md"])}</li>`,
    ...swpList("Executive-Summary.md", "Planned, not built").map((t) => `        <li class="swp-claim"><span class="swp-tag planned">Planned</span> ${swpInline(t)} ${swpCites(swpNoteFirst(t, ["docs/wiki/Executive-Summary.md"]))}</li>`),
    `      </ul>`,
`      <p class="swp-note">The robots are simulated; no hardware result is stated. No partnership, customer or commercial figure appears on this page. Standards are named, never quoted, and nothing here claims compliance. The full evidence table and changelog are in the repository's wiki. <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Evidence.md">docs/wiki/Evidence.md</a></cite></p>`,
  ] },
];

/** The whole page, as a string. */
export function swpBuildPage() {
  const kickers = WF_WHITEPAPER.sections;
  if (kickers.length !== SWP_SECTION_DEFS.length) throw new Error(`gen_whitepaper_page: ${SWP_SECTION_DEFS.length} sections but ${kickers.length} in WF_WHITEPAPER.sections`);
  const page = wfPages().find((p) => p.key === WF_WHITEPAPER.key);
  const nav = SWP_SECTION_DEFS.map((s) => `        <li><a href="#${s.id}">${s.nav}</a></li>`).join("\n");
  const sections = SWP_SECTION_DEFS.map((s, i) => [
    `    <section class="swp-sec" id="${s.id}" aria-labelledby="${s.id}-h">`,
    `      <p class="swp-kicker">${swpEsc(kickers[i])}</p>`,
    `      <h2 id="${s.id}-h">${s.h2}</h2>`,
    ...s.parts(),
    `    </section>`,
  ].join("\n")).join("\n\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${wfBlock(page, WF_WHITEPAPER.key)}
<link rel="stylesheet" href="./shared/design.css">
<style>
  /* Generated by tools/gen_whitepaper_page.mjs (console SEO-WHITEPAPER-2): edit the generator, not this page. */
  /* The whitepaper page (console SEO-WHITEPAPER). The design system's roles (shared/design.css), with fallbacks so the page paints without it. */
  :root { --bg: var(--at-bg, #0b1520); --panel: var(--at-surface, #101e2b); --line: var(--at-border, #2c4458); --ink: var(--at-on-surface, #eef5fa); --muted: var(--at-on-surface-muted, #b6c8d6); --accent: var(--at-primary, #4fd1ff); --ok: var(--at-success, #6fdc9a); --warn: var(--at-warning, #ffc861); --cond: var(--at-font-display, system-ui, sans-serif); --mono: var(--at-font-mono, ui-monospace, Menlo, Consolas, monospace); }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 17px/1.6 var(--at-font-body, system-ui, -apple-system, "Segoe UI", sans-serif); overflow-wrap: break-word; }
  :focus-visible { outline: 3px solid var(--at-focus, var(--accent)); outline-offset: 2px; }
  a { color: var(--accent); }
  .skip { position: absolute; left: -9999px; top: 0; background: var(--panel); color: var(--ink); padding: 12px 16px; }
  .skip:focus { left: 16px; top: 8px; z-index: 20000; }
  .swp-wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
  header.swp-top { border-bottom: 1px solid var(--line); background: var(--at-raised, #0a121b); }
  header.swp-top .swp-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding-top: 64px; padding-bottom: 10px; }
  .swp-brand { font: 700 15px/1 var(--cond); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-right: auto; }
  nav.swp-nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  nav.swp-nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: var(--at-r-pill, 999px); border: 1px solid var(--line); color: var(--ink); text-decoration: none; font: 600 14.5px/1 var(--cond); letter-spacing: .04em; text-transform: uppercase; }
  nav.swp-nav a:hover { border-color: var(--accent); }
  .swp-hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 28px; align-items: center; padding: 48px 0 28px; }
  .swp-eyebrow { margin: 0 0 8px; color: var(--accent); font: 700 14px/1.2 var(--cond); letter-spacing: .16em; text-transform: uppercase; }
  h1 { margin: 0 0 14px; font: 700 clamp(32px, 5.4vw, 56px)/1.04 var(--cond); text-transform: uppercase; letter-spacing: .01em; }
  .swp-lead { margin: 0 0 18px; color: var(--muted); font-size: 19px; max-width: 60ch; }
  .swp-hero svg { width: 100%; height: auto; display: block; }
  /* The diagram paints from the same roles as the page, so the design system's light scheme (:root[data-theme="light"] in shared/design.css) recolours it too. */
  .swp-hero svg .swp-d-card { fill: var(--at-raised, #0a121b); stroke: var(--line); }
  .swp-hero svg .swp-d-glow { stop-color: var(--accent); }
  .swp-hero svg .swp-d-ring { stroke: var(--line); fill: none; }
  .swp-hero svg .swp-d-gov { fill: var(--panel); stroke: var(--ok); }
  .swp-hero svg .swp-d-tick { stroke: var(--ok); fill: none; }
  .swp-hero svg .swp-d-agent { fill: var(--panel); stroke: var(--accent); }
  .swp-hero svg .swp-d-dot { fill: var(--accent); }
  .swp-hero svg .swp-d-site { fill: var(--at-surface-2, #16283a); stroke: var(--warn); }
  .swp-hero svg .swp-d-wire, .swp-hero svg .swp-d-glyph { stroke: var(--warn); fill: none; }
  .swp-cta { display: flex; flex-wrap: wrap; gap: 10px; }
  .swp-btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 18px; border-radius: var(--at-r-md, 10px); border: 1px solid var(--line); background: var(--panel); color: var(--ink); text-decoration: none; font: 700 15px/1 var(--cond); letter-spacing: .05em; text-transform: uppercase; }
  .swp-btn.primary { background: var(--accent); color: var(--at-on-primary, #03202b); border-color: var(--accent); }
  section.swp-sec { border-top: 1px solid var(--line); padding: 36px 0 30px; scroll-margin-top: 56px; }
  .swp-kicker { margin: 0; color: var(--muted); font: 700 13.5px/1.2 var(--cond); letter-spacing: .16em; text-transform: uppercase; }
  h2 { margin: 4px 0 12px; font: 700 clamp(26px, 3.6vw, 36px)/1.12 var(--cond); text-transform: uppercase; letter-spacing: .02em; }
  h3 { margin: 22px 0 8px; font: 700 21px/1.2 var(--cond); color: var(--accent); letter-spacing: .02em; }
  section p { max-width: 72ch; }
  .swp-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 16px 0 6px; padding: 0; list-style: none; }
  .swp-tile { background: var(--panel); border: 1px solid var(--line); border-radius: var(--at-r-lg, 12px); padding: 14px 16px; margin: 0; }
  .swp-tile b { display: block; font: 700 30px/1.1 var(--cond); color: var(--ink); }
  .swp-tile span { display: block; color: var(--muted); font-size: 16px; }
  ul.swp-claims { padding-left: 20px; margin: 10px 0; }
  ul.swp-claims > li { margin: 8px 0; max-width: 78ch; }
  cite { display: inline; font-style: normal; font-size: 16px; color: var(--muted); }
  cite a { font-family: var(--mono); font-size: 14.5px; color: var(--muted); text-decoration-color: var(--line); overflow-wrap: anywhere; }
  td cite { display: block; }
  .swp-row { display: block; margin: 0 0 4px; }
  .swp-video { margin: 16px 0 8px; max-width: 760px; }
  .swp-video video { display: block; width: 100%; height: auto; background: #000; border: 1px solid var(--line); border-radius: var(--at-r-md, 10px); }
  .swp-video figcaption { color: var(--muted); font-size: 16px; margin-top: 6px; }
  @media (min-width: 761px) { .swp-table td:last-child, .swp-table th:last-child { width: 300px; } }
  cite a:hover { color: var(--accent); }
  code { font: 15px var(--mono); background: var(--at-raised, #0a121b); padding: 1px 5px; border-radius: var(--at-r-xs, 5px); }
  .swp-table { overflow-x: auto; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 16px; }
  th, td { text-align: left; vertical-align: top; padding: 9px 10px; border-bottom: 1px solid var(--line); }
  th { color: var(--muted); font: 600 13.5px/1.3 var(--cond); letter-spacing: .08em; text-transform: uppercase; }
  .swp-tag { display: inline-block; padding: 1px 8px; border-radius: var(--at-r-pill, 999px); font: 700 13px/1.6 var(--cond); letter-spacing: .06em; text-transform: uppercase; border: 1px solid var(--line); }
  .swp-tag.built { color: var(--ok); border-color: var(--ok); }
  .swp-tag.planned { color: var(--warn); border-color: var(--warn); }
  .swp-note { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: var(--at-r-md, 10px); padding: 12px 16px; margin: 14px 0; max-width: 78ch; }
  footer.swp-foot { border-top: 1px solid var(--line); color: var(--muted); padding: 26px 0 64px; font-size: 16px; }
  footer.swp-foot ul { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-wrap: wrap; gap: 8px 18px; }
  footer.swp-foot a { display: inline-flex; align-items: center; min-height: 44px; }
  @media (max-width: 760px) {
    .swp-hero { grid-template-columns: 1fr; padding-top: 28px; }
    .swp-hero svg { max-width: 420px; margin: 0 auto; }
    body { font-size: 16.5px; }
    /* On a phone each table row becomes a card: feature, then measure, then its source on a line of its own. */
    .swp-table table, .swp-table tbody, .swp-table tr, .swp-table td { display: block; width: 100%; }
    .swp-table thead { position: absolute; left: -9999px; }
    .swp-table tr { background: var(--panel); border: 1px solid var(--line); border-radius: var(--at-r-md, 10px); padding: 8px 14px; margin: 10px 0; }
    .swp-table td { border: 0; padding: 3px 0; }
    .swp-table td:first-child { font-weight: 700; }
  }
  @media print { header.swp-top, .swp-cta, footer.swp-foot ul { display: none; } body { background: #fff; color: #000; } }
</style>
</head>
<body>
<a class="skip" href="#swp-main">Skip to the whitepaper</a>
<header class="swp-top">
  <div class="swp-wrap">
    <span class="swp-brand">SmartCiti.X Holodeck · whitepaper</span>
    <nav class="swp-nav" aria-label="Whitepaper sections">
      <ul>
${nav}
      </ul>
    </nav>
  </div>
</header>

<main id="swp-main">
  <div class="swp-wrap">
    <div class="swp-hero" id="swp-hero">
      <div>
        <p class="swp-eyebrow">Whitepaper · from the repository</p>
        <h1>Practice that teaches people and trains simulated robots</h1>
        <p class="swp-lead">SmartCiti.X Holodeck is a browser and headset training platform. The same practice has a teaching job and a data job: it teaches people to work safely around robots, and only when an adult learner opts in does it become demonstration data, on that learner's device, for simulated robots. Every figure below names the committed repository file it comes from. The robots are simulated; no hardware result is claimed.</p>
        <div class="swp-cta">
          <a class="swp-btn primary" href="#hive">Meet the Omega Hive</a>
          <a class="swp-btn" href="./index.html">Open the training site</a>
        </div>
      </div>
      <svg viewBox="0 0 440 340" role="img" aria-label="Diagram: software agents around a safety governor, which stands between them and the simulated robot sites">
        <defs>
          <radialGradient id="swp-glow" cx="50%" cy="50%" r="50%"><stop class="swp-d-glow" offset="0" stop-opacity=".35"/><stop class="swp-d-glow" offset="1" stop-opacity="0"/></radialGradient>
        </defs>
        <rect class="swp-d-card" x="0" y="0" width="440" height="340" rx="16"/>
        <circle cx="220" cy="150" r="128" fill="url(#swp-glow)"/>
        <g class="swp-d-ring" stroke-width="1.5">
          <circle cx="220" cy="150" r="96"/>
          <path d="M220 69 L220 116 M283.3 99.5 L246.6 128.8 M299 168.1 L253.1 157.6 M255.1 223 L234.7 180.6 M184.9 223 L205.3 180.6 M141 168.1 L186.9 157.6 M156.7 99.5 L193.4 128.8"/>
        </g>
        <polygon class="swp-d-gov" points="220,116 249,133 249,167 220,184 191,167 191,133" stroke-width="3"/>
        <path class="swp-d-tick" d="M208 150 l8 8 l16 -18" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <g class="swp-d-agent" stroke-width="2.5">
          <circle cx="220" cy="54" r="15"/><circle cx="295" cy="90.1" r="15"/><circle cx="313.6" cy="171.4" r="15"/><circle cx="261.6" cy="236.5" r="15"/>
          <circle cx="178.4" cy="236.5" r="15"/><circle cx="126.4" cy="171.4" r="15"/><circle cx="145" cy="90.1" r="15"/>
        </g>
        <g class="swp-d-dot"><circle cx="220" cy="50" r="4"/><circle cx="295" cy="86.1" r="4"/><circle cx="313.6" cy="167.4" r="4"/><circle cx="261.6" cy="232.5" r="4"/><circle cx="178.4" cy="232.5" r="4"/><circle cx="126.4" cy="167.4" r="4"/><circle cx="145" cy="86.1" r="4"/></g>
        <g class="swp-d-site" stroke-width="2">
          <rect x="28" y="286" width="52" height="34" rx="4"/><rect x="96" y="286" width="52" height="34" rx="4"/><rect x="164" y="286" width="52" height="34" rx="4"/>
          <rect x="232" y="286" width="52" height="34" rx="4"/><rect x="300" y="286" width="52" height="34" rx="4"/><rect x="368" y="286" width="52" height="34" rx="4"/>
        </g>
        <g class="swp-d-wire" stroke-width="2" stroke-dasharray="4 5"><path d="M220 184 L220 262 M54 286 L54 274 L394 274 L394 286 M122 274 v12 M190 274 v12 M258 274 v12 M326 274 v12"/></g>
        <g class="swp-d-glyph" stroke-width="2.5" stroke-linecap="round">
          <path d="M44 312 l8 -12 l10 6 l6 -10"/><path d="M110 312 h24 M116 312 v-12 h12 v12"/><path d="M178 296 h24 M190 296 v18"/>
          <path d="M246 300 h24 v12 h-24 z"/><path d="M314 312 l10 -14 l10 14"/><path d="M382 300 h24 M382 312 h24"/>
        </g>
      </svg>
    </div>

    <ul class="swp-tiles" aria-label="Headline figures">
      <li class="swp-tile swp-claim"><b>742</b><span>training stations, mean content score 95.8 of 100</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/investor/platform-summary.json">docs/investor/platform-summary.json</a></cite> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Executive-Summary.md">docs/wiki/Executive-Summary.md</a></cite></li>
      <li class="swp-tile swp-claim"><b>7</b><span>software agents in the Omega Hive, each named by a classifier at 0.950 accuracy (chance 0.143)</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/OMEGA-HIVE.md">docs/consoles/OMEGA-HIVE.md</a></cite></li>
      <li class="swp-tile swp-claim"><b>3,631 of 3,631</b><span>simulated run steps checked by the safety governor; 0 dispatches to a physical robot</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/OMEGA-HIVE.md">docs/consoles/OMEGA-HIVE.md</a></cite></li>
      <li class="swp-tile swp-claim"><b>6 of 6</b><span>robot sites with a walk-in robotics room</span> <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/consoles/ROBO-INTERIORS.md">docs/consoles/ROBO-INTERIORS.md</a></cite></li>
    </ul>

${sections}
  </div>
</main>

<footer class="swp-foot">
  <div class="swp-wrap">
    <p>This page is static: it reads the same without JavaScript. It is generated by <code>tools/gen_whitepaper_page.mjs</code> from the wiki and the committed notes; every figure above is copied from the committed file cited beside it, and <code>tools/check_whitepaper_page.mjs</code> fails if one is not found there.</p>
    <ul>
      <li><a href="./index.html">Back to the homepage</a></li>
      <li><a href="./privacy.html">Privacy — what is stored where</a></li>
      <li><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/README.md">Documentation index</a></li>
      <li><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/docs/wiki/Home.md">The wiki</a></li>
    </ul>
  </div>
</footer>
<script type="module">import { ctlMount } from "./shared/controls.js"; ctlMount({ world: "the whitepaper", home: "./index.html", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page.", interact: "Enter follows the focused link.", map: "—", view: "—", quality: "Set inside each world." } });</script>
<script type="module">import { gdMount } from "./shared/guide.js"; gdMount({ root: "./" });</script>
</body>
</html>
`;
  if (wfStamp(html, wfBlock(page, WF_WHITEPAPER.key)) !== html) throw new Error("gen_whitepaper_page: gen_seo.mjs would re-stamp the page differently");
  return html;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = swpBuildPage();
  const path = join(SWP_GEN_ROOT, SWP_GEN_OUT);
  const now = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (process.argv.includes("--check")) {
    if (now !== out) { console.log(`${SWP_GEN_OUT} is stale: run node tools/gen_whitepaper_page.mjs`); process.exit(1); }
    console.log(`${SWP_GEN_OUT} is current.`);
  } else {
    if (now !== out) writeFileSync(path, out);
    console.log(`${now === out ? "Unchanged" : "Wrote"} ${SWP_GEN_OUT} (${SWP_SECTION_DEFS.length} sections, ${(out.match(/class="[^"]*\bswp-claim\b/g) ?? []).length} claims).`);
  }
}
