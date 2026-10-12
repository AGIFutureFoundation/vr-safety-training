/**
 * Generates WebXR/redwood/js/rw-lore-data.js — Redwood Reach's hidden field
 * tins (the eggs/treasures) and its K-12 field lessons.
 *
 *     node tools/gen_redwood.mjs
 *
 * Every field tin's lesson is the FIRST SENTENCE of a real station's own `why`
 * line in a real programme (WebXR/smartcity/js/curricula.js), read here at
 * generation time — so a lesson is always a verbatim quote of shipped content
 * (tools/check_redwood.mjs re-verifies the substring), and a station moved
 * out of its programme makes this script throw instead of shipping a stale
 * tin. The field lessons are authored below: one idea per step, a check
 * question, each tied to a K-12 station in the catalog and to the trade here
 * that uses the idea. No number, limit, date, species fact or real place is
 * stated anywhere (tools/briefs/frontier-brief.md, facts rule).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const OUT = join(WEBXR, "redwood", "js", "rw-lore-data.js");
const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "curricula.js")));
const { RW_LANDMARKS } = await import(pathToFileURL(join(WEBXR, "redwood", "js", "rw-data.js")));

function firstSentence(text) {
  const m = /^(.+?[.!?])(\s|$)/.exec(String(text ?? "").trim());
  return m ? m[1] : String(text ?? "").trim();
}
function whyOf(programmeId, stationId) {
  const p = CURRICULA.find((c) => c.id === programmeId);
  if (!p) throw new Error(`gen_redwood: no programme "${programmeId}"`);
  const s = p.stations.find((x) => x.id === stationId);
  if (!s?.why) throw new Error(`gen_redwood: station "${stationId}" is not in programme "${programmeId}"`);
  return firstSentence(s.why);
}

// landmark → [programme, station]: a tin at each landmark quotes that station.
const TINS = [
  ["cathedral-ring", "grounds-and-landscaping", "gk-tree-work-pole-saw-and-drop-zone"],
  ["fallen-giant", "grounds-and-landscaping", "gk-chainsaw-start-and-limbing-on-the-ground"],
  ["grove-bench", "hunters-point-bay-restoration", "marsh-transect-survey"],
  ["engine-bay", "first-responders", "wildland-urban-interface"],
  ["hose-tower", "first-responders", "firefighter-rehab-sector"],
  ["helispot", "bay-restoration-maritime-underwater", "br-drone-shoreline-survey"],
  ["lookout-cab", "first-responders", "or-wildland-fireline-construction-and-lookout"],
  ["firefinder-rock", "k12-literacy-and-life-skills", "k12-first-aid-awareness-call-for-help"],
  ["switchback-bend", "heavy-equipment-operators", "op-dozer-slope-work-and-rollover-protection"],
  ["log-deck", "heavy-equipment-operators", "op-loader-truck-loading-and-blind-spots"],
  ["debarker", "warehouse-and-logistics-automation", "tw-conveyor-jam-clearing-and-loto"],
  ["planer-shed", "transit-ramp", "forklift-dock"],
  ["log-jam", "bay-restoration-maritime-underwater", "br-culvert-retrofit-for-fish-passage"],
  ["old-culvert", "bay-restoration-maritime-underwater", "br-fish-screen-maintenance"],
  ["willow-stakes", "bay-restoration-maritime-underwater", "br-native-planting-and-erosion-mats"],
  ["trailhead-kiosk", "bay-restoration-maritime-underwater", "br-volunteer-cleanup-day-safety-lead"],
  ["amphitheatre", "education-support-staff", "ed-playground-equipment-inspection"],
  ["host-site", "grounds-and-landscaping", "gk-string-trimmer-and-blower-ppe-and-bystander-zone"],
  ["seed-vault", "marine-ecology-and-restoration", "me-eelgrass-seed-collection-and-nursery"],
  ["shade-house", "grounds-and-landscaping", "gk-greenhouse-nursery-chemical-storage-and-eyewash"],
  ["potting-shed", "grounds-and-landscaping", "gk-pesticide-and-fertilizer-application-per-the-label"],
  ["switchyard-gate", "electrical-first-period", "substation-switching"],
  ["corridor-tower", "energy-transition", "or-transmission-line-right-of-way-patrol"],
  ["danger-tree", "electrical-first-period", "line-truck"],
  ["boardwalk-end", "marine-ecology-and-restoration", "me-tidal-marsh-channel-restoration-day"],
  ["seine-beach", "bay-restoration-maritime-underwater", "br-beach-seine-fish-survey-and-handling"],
  ["tide-stake", "hunters-point-bay-restoration", "spartina-removal"],
  ["river-mouth", "hunters-point-bay-restoration", "living-shoreline"],
  ["dozer-line", "heavy-equipment-operators", "op-equipment-daily-walkaround-and-fluids"],
  ["road-gate", "heavy-equipment-operators", "op-grader-fine-grade-and-crown"],
  ["water-tank", "builders-trades", "or-ranch-road-grading-and-culvert"],
  ["tool-cache", "grounds-and-landscaping", "gk-storm-cleanup-chipper-and-traffic-control"],
  ["blowdown", "bay-restoration-maritime-underwater", "br-bird-nesting-buffer-and-work-window"],
  ["waterbar", "heavy-equipment-operators", "op-excavator-trench-and-utility-locate"],
  ["fuel-break-west", "postal-and-mail-processing", "ml-heat-and-cold-stress-on-route"],
  ["fuel-break-east", "water-and-gas-utility-crews", "ut-night-storm-response-crew-and-portable-generator"],
];

const eggs = TINS.map(([lm, programme, stationId]) => {
  const l = RW_LANDMARKS.find((x) => x.id === lm);
  if (!l) throw new Error(`gen_redwood: no landmark "${lm}"`);
  // A small deterministic offset, so the tin is near the landmark, not on it.
  const h = [...lm].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ox = ((h % 17) - 8) * 1.5, oz = (((h >> 5) % 17) - 8) * 1.5;
  return {
    id: `rw-egg-${lm}`, title: `Field Tin — ${l.name}`, kind: "egg", landmark: lm, site: l.site,
    position: [l.position[0] + ox, l.position[1] + oz], method: "tin", set: l.site,
    cites: { app: "smartcity", programme, stationId }, lesson: whyOf(programme, stationId),
    reward: { xp: 25, badge: "Field Tin" },
  };
});

// ------------------------------------------------------------ field lessons
// Schema (compatible with the frontier brief's field-lesson ask; documented
// in docs/consoles/REDWOOD.md): { id, title, site, landmark, k12, trade,
// tradeLine, minutes, steps: [text…] (2–4, one idea each), check: { q,
// options, answer } }.
const lessons = [
  { id: "rw-fl-map-scale", title: "Reading the Trail Map's Scale", site: "campground", landmark: "trailhead-kiosk", k12: "k12-reading-a-map-scale-in-bay-world",
    trade: "Trail crew", tradeLine: "A trail crew lead plans the day's walk-in from the map's scale bar before anyone shoulders a tool.",
    minutes: 3, steps: ["A map shrinks the land by the same amount everywhere; the scale bar shows how much.", "Lay a string along the trail on the map, then hold it against the scale bar.", "The crew lead uses that length to plan the walk-in time and the turnaround time."],
    check: { q: "Why does the crew lead measure the trail against the scale bar?", options: ["To plan the walk-in and turnaround", "To decide the trail's colour"], answer: 0 } },
  { id: "rw-fl-water-cycle", title: "Fog, Rain and the River", site: "old-growth", landmark: "cathedral-ring", k12: "k12-water-cycle-and-filtration",
    trade: "Watershed restoration", tradeLine: "Restoration crews plant and grade so the water that falls here soaks in and reaches the river slowly.",
    minutes: 3, steps: ["Water evaporates from the sea, cools into cloud and fog, and falls back as rain or drip.", "Roots and soil hold that water and let it seep into the river slowly.", "Bare, compacted ground sends it off fast, carrying soil with it."],
    check: { q: "What slows water down on its way to the river?", options: ["Roots and loose soil", "Bare, packed ground"], answer: 0 } },
  { id: "rw-fl-filtration", title: "The Estuary as a Filter", site: "estuary", landmark: "boardwalk-end", k12: "k12-water-cycle-and-filtration",
    trade: "Watershed restoration", tradeLine: "The estuary crew walks fixed lines through the marsh because the marsh plants are part of how the water is cleaned.",
    minutes: 2, steps: ["Marsh plants slow the water where the river meets the sea.", "Slow water drops the fine soil it was carrying.", "That is filtration: separating what the water carries from the water."],
    check: { q: "What does slowing the water do?", options: ["Lets the fine soil settle out", "Makes the water saltier"], answer: 0 } },
  { id: "rw-fl-safety-labels", title: "Read the Label First", site: "nursery", landmark: "potting-shed", k12: "k12-reading-instructions-and-safety-labels",
    trade: "Nursery worker", tradeLine: "A nursery worker reads the label and the safety data sheet before a container is opened, every time.",
    minutes: 3, steps: ["A label tells you what is inside, how to use it and how to protect yourself.", "The signal word and the pictures come first — read them before anything else.", "The amount to use is always the label's amount: per the label, never a guess."],
    check: { q: "Where does the amount to mix come from?", options: ["The label", "Whatever looks right"], answer: 0 } },
  { id: "rw-fl-call-for-help", title: "A Clear Location When You Call", site: "lookout", landmark: "lookout-cab", k12: "k12-first-aid-awareness-call-for-help",
    trade: "Fire lookout", tradeLine: "A lookout reports a smoke with a clear location a crew can find, then keeps the line open.",
    minutes: 2, steps: ["When you call for help, the first thing they need is where you are.", "Name something they can find: a trail name, a road gate, a landmark.", "Stay on the line until they tell you to hang up."],
    check: { q: "What does a helper need first when you call?", options: ["Where you are", "What you had for lunch"], answer: 0 } },
  { id: "rw-fl-incident-report", title: "Writing What Happened", site: "fire-station", landmark: "engine-bay", k12: "k12-writing-a-clear-incident-report",
    trade: "Wildland firefighter", tradeLine: "After every training day the crew writes up what went right and what nearly went wrong, plainly.",
    minutes: 3, steps: ["A good report says what happened, in the order it happened.", "It sticks to what you saw, not what you guess.", "It says what was done next, so the next crew can learn from it."],
    check: { q: "What belongs in an incident report?", options: ["What you saw, in order", "What you guess might have happened"], answer: 0 } },
  { id: "rw-fl-energy", title: "Energy on the Line", site: "substation", landmark: "switchyard-gate", k12: "k12-energy-transfer-at-the-wind-farm",
    trade: "Lineman", tradeLine: "Linemen treat every line as energised because the energy moving through it can move through a person too.",
    minutes: 3, steps: ["Energy moves from where it is made, along the lines, to the homes that use it.", "The substation changes it so it can travel far and then be used safely nearby.", "A tree touching a line can give that energy a new path — that is why the corridor is kept clear."],
    check: { q: "Why is the line corridor kept clear of trees?", options: ["So the energy has no new path through them", "So the view is nicer"], answer: 0 } },
  { id: "rw-fl-timeline", title: "The Lookout's Logbook as a Timeline", site: "lookout", landmark: "firefinder-rock", k12: "k12-building-a-timeline-from-documents",
    trade: "Fire lookout", tradeLine: "A lookout's log is read later as a timeline: when each smoke was seen and what was done.",
    minutes: 2, steps: ["A log records events with the time each one happened.", "Put the entries in time order and you have a timeline.", "A timeline shows what came first and what followed from it."],
    check: { q: "What turns log entries into a timeline?", options: ["Putting them in time order", "Counting the pages"], answer: 0 } },
  { id: "rw-fl-sources", title: "Primary and Secondary at the Mill", site: "sawmill", landmark: "planer-shed", k12: "k12-primary-and-secondary-sources",
    trade: "Sawmill operator", tradeLine: "The millwright trusts the machine's own lockout tag and log over a story about it.",
    minutes: 2, steps: ["A primary source was made at the time by someone who was there: a tag, a log entry, a photo.", "A secondary source retells it later.", "When they disagree, go back to the primary source."],
    check: { q: "Which is a primary source?", options: ["The lockout tag on the machine", "A friend's retelling"], answer: 0 } },
  { id: "rw-fl-measure", title: "Pacing a Plot", site: "equipment-yard", landmark: "fuel-break-west", k12: "k12-measuring-and-scaling-the-court",
    trade: "Fuel-break survey crew", tradeLine: "Survey crews lay out the same size plot at every post so the sheets can be compared.",
    minutes: 3, steps: ["A survey plot is measured out the same way at every post.", "Using the same size means one plot can be compared with the next.", "Scale the plot on paper the same way, so the sheet matches the ground."],
    check: { q: "Why is every plot laid out the same way?", options: ["So plots can be compared", "So it looks tidy"], answer: 0 } },
];
for (const fl of lessons) if (!RW_LANDMARKS.some((l) => l.id === fl.landmark)) throw new Error(`gen_redwood: lesson ${fl.id} has no landmark ${fl.landmark}`);

const out = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_redwood.mjs\`.
 *
 * Redwood Reach's hidden field tins (egg format: id, title, kind "egg",
 * landmark, method, cites, lesson, reward — the Deep's lantern shape, with a
 * position and a themed \`set\` per site) and its K-12 field lessons. Every
 * tin's lesson is the first sentence of the cited station's own why line in
 * WebXR/smartcity/js/curricula.js.
 */

export const RW_EGGS = ${JSON.stringify(eggs, null, 2)};

export const RW_FIELD_LESSONS = ${JSON.stringify(lessons, null, 2)};
`;
writeFileSync(OUT, out);
console.log(`gen_redwood: wrote ${OUT.slice(ROOT.length + 1)} (${eggs.length} field tins, ${lessons.length} field lessons)`);
