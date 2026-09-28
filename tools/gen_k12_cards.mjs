/**
 * Teacher tools for the K-12 field lessons (console SCHOLAR-4).
 *
 *     node tools/gen_k12_cards.mjs
 *
 * Writes WebXR/k12/teacher.html from the same lesson data the worlds play
 * (WebXR/shared/field-lessons.js, Sierra Summit's SM_FIELD_LESSONS, Redwood
 * Reach's RW_FIELD_LESSONS): a teacher view listing every lesson by programme
 * and band with a link to its full K-12 station, and one printable lesson card
 * per lesson (title, the three steps, the check with its answer and why, the
 * trade line). The page's only script reads this browser's passport for the
 * learner's Field Notes count per world (k2FieldNotes); nothing is fetched and
 * nothing leaves the device. Regenerate after any lesson changes; check_k12
 * section 8d reads the page against the data.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { K2_FIELD_LESSONS, K2_WORLD_PAGES, k2LessonLink } = await import("../WebXR/shared/field-lessons.js");
const { SM_FIELD_LESSONS } = await import("../WebXR/shared/summit-data.js");
const { RW_FIELD_LESSONS } = await import("../WebXR/redwood/js/rw-lore-data.js");
const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");
const { lkStationLink, lkStationLabel } = await import("../WebXR/shared/links.js");

export const K2_WORLD_NAMES = { bayworld: "Bay World", deep: "The Deep", regatta: "The Regatta", fairway: "Fairway Park", summit: "Sierra Summit", redwood: "Redwood Reach" };
// the same adaptation WebXR/shared/field-kiosk.js makes at run time (k2AdaptLesson), kept here so the generator needs no browser storage
const adapt = (l, world) => ({ ...l, world, station: l.station ?? l.k12, tradeLine: l.tradeLine ?? l.trade, position: l.position ?? l.at ?? null,
  check: { ...l.check, question: l.check.question ?? l.check.q, options: l.check.options ?? l.check.choices } });
export const ALL_LESSONS = [...K2_FIELD_LESSONS, ...SM_FIELD_LESSONS.map((l) => adapt(l, "summit")), ...RW_FIELD_LESSONS.map((l) => adapt(l, "redwood"))];

const K12 = CURRICULA.filter((c) => c.audience === "classroom");
const programmeOf = new Map();
for (const c of K12) for (const s of c.stations) programmeOf.set(s.id, c);
const BAND_ORDER = ["early primary", "upper primary", "lower secondary", "upper secondary"];
const bandRank = (b) => { const i = BAND_ORDER.findIndex((x) => String(b ?? "").startsWith(x)); return i < 0 ? BAND_ORDER.length : i; };
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const link = (l) => k2LessonLink(l, lkStationLink);
const anchorOf = (l) => l.anchor ? `${l.anchor.kind} ${l.anchor.id}` : l.place ? `at ${l.place}` : l.landmark ? `${l.site}, ${l.landmark}` : l.site ?? "";

function teacherView() {
  const rows = [];
  for (const c of K12) {
    const mine = ALL_LESSONS.filter((l) => programmeOf.get(l.station)?.id === c.id).sort((a, b) => bandRank(a.band) - bandRank(b.band) || a.title.localeCompare(b.title));
    rows.push(`<section class="programme" id="prog-${esc(c.id)}"><h3>${esc(c.name)} <small>${esc(c.band)} · ${mine.length} field lessons</small></h3><table><thead><tr><th>Lesson</th><th>World</th><th>Band</th><th>Min</th><th>Trade</th><th>Station</th><th></th></tr></thead><tbody>`);
    for (const l of mine) rows.push(`<tr data-world="${esc(l.world)}"><td>${esc(l.title)}</td><td>${esc(K2_WORLD_NAMES[l.world] ?? l.world)}</td><td>${esc(l.band ?? "")}</td><td>${esc(l.minutes)}</td><td>${esc(l.trade)}</td><td><a href="${esc(link(l))}">${esc(lkStationLabel(l.station))}</a></td><td><a href="#card-${esc(l.id)}">Card</a></td></tr>`);
    rows.push(`</tbody></table></section>`);
  }
  const orphans = ALL_LESSONS.filter((l) => !programmeOf.has(l.station));
  if (orphans.length) rows.push(`<p class="note">${orphans.length} lesson(s) point at a station outside the four classroom programmes.</p>`);
  return rows.join("\n");
}

function card(l) {
  const c = l.check;
  return `<article class="card" id="card-${esc(l.id)}" data-world="${esc(l.world)}">
  <p class="eyebrow">K-12 field lesson · ${esc(K2_WORLD_NAMES[l.world] ?? l.world)} · ${esc(anchorOf(l))} · ${esc(l.minutes)} min · ${esc(l.band ?? "")}</p>
  <h3>${esc(l.title)}</h3>
  <p class="trade">${esc(l.tradeLine)}</p>
  <ol>${l.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  <p class="q"><b>${esc(c.question)}</b></p>
  <ul class="options">${c.options.map((o, i) => `<li${i === c.answer ? ' class="answer"' : ""}>${esc(o)}${i === c.answer ? " <span>(answer)</span>" : ""}</li>`).join("")}</ul>
  ${c.why ? `<p class="why">${esc(c.why)}</p>` : ""}
  <p class="links">Full station: <a href="${esc(link(l))}">${esc(lkStationLabel(l.station))}</a> · programme: ${esc(programmeOf.get(l.station)?.name ?? "—")}</p>
</article>`;
}

const worlds = Object.keys(K2_WORLD_NAMES);
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>K-12 field lessons — teacher view and lesson cards</title>
<meta name="description" content="Every K-12 field lesson in the SmartCiti.X worlds, by programme and band, with a printable card per lesson. Field Notes counts read this browser's passport only.">
<style>
  :root { color-scheme: light dark; --ink: #1c1a24; --paper: #fbf8f2; --teal: #2a7f78; --line: #cfc9bf; }
  @media (prefers-color-scheme: dark) { :root { --ink: #eaf0f2; --paper: #14181c; --teal: #6ad0c8; --line: #3a4046; } }
  body { margin: 0; font: 16px/1.45 system-ui, sans-serif; color: var(--ink); background: var(--paper); }
  main { max-width: 1080px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; } h2 { font-size: 1.3rem; margin: 32px 0 8px; } h3 { font-size: 1.1rem; margin: 20px 0 6px; }
  h3 small { font-weight: normal; opacity: .75; font-size: .85rem; }
  .note, .eyebrow, .links { font-size: .9rem; opacity: .8; }
  .notes { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 8px 0 16px; padding: 0; list-style: none; }
  .notes li { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  table { width: 100%; border-collapse: collapse; font-size: .92rem; } th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--teal); font-weight: 600; }
  a { color: var(--teal); }
  .tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 12px 0; }
  button, select { font: inherit; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: inherit; }
  button.primary { background: var(--teal); color: #fff; border-color: var(--teal); }
  .card { border: 1px solid var(--line); border-radius: 12px; padding: 16px 20px; margin: 12px 0; background: var(--paper); }
  .card .trade { font-style: italic; } .card ol { padding-left: 22px; } .card .options { list-style: none; padding: 0; }
  .card .options li { padding: 2px 0 2px 26px; position: relative; } .card .options li::before { content: "○"; position: absolute; left: 4px; }
  .card .options li.answer::before { content: "●"; color: var(--teal); } .card .options li.answer span { opacity: .7; font-size: .85rem; }
  .card .why { font-size: .92rem; border-left: 3px solid var(--teal); padding-left: 10px; }
  [hidden] { display: none !important; }
  @media print {
    body { background: #fff; color: #000; } main { max-width: none; padding: 0; }
    .no-print, .teacher-view, h1, .lead, .notes { display: none !important; }
    .card { border: 1px solid #000; border-radius: 0; break-inside: avoid; page-break-inside: avoid; margin: 0 0 14mm; }
    .card a { color: #000; text-decoration: none; }
  }
</style>
</head>
<body>
<main>
  <h1>K-12 field lessons — teacher view</h1>
  <p class="lead">Every field lesson in the SmartCiti.X worlds (${ALL_LESSONS.length} lessons across ${worlds.length} worlds), by classroom programme and band, and a printable card for each. The lessons are the ones a learner plays at a kiosk, a course card or a job board; the card carries the same three steps and the same check, with the answer marked for the teacher.</p>
  <p class="note">Nothing leaves this device. The Field Notes counts below read the passport stored in this browser only: how many of each world's lessons this learner has answered right, and whether the world's Field Notes badge is earned. On a shared class device they show the device's passport, not any one pupil's.</p>
  <h2>Field Notes on this device</h2>
  <ul class="notes">${worlds.map((w) => `<li><b>${esc(K2_WORLD_NAMES[w])}</b>: <span data-k2-notes="${w}">—</span></li>`).join("")}</ul>
  <div class="tools no-print">
    <label>World <select id="world-filter"><option value="">all worlds</option>${worlds.map((w) => `<option value="${w}">${esc(K2_WORLD_NAMES[w])}</option>`).join("")}</select></label>
    <button class="primary" id="print-cards" type="button">Print the lesson cards</button>
    <span class="note">Printing hides this view and prints one card per lesson in the chosen world.</span>
  </div>
  <section class="teacher-view">
    <h2>Lessons by programme and band</h2>
${teacherView()}
  </section>
  <section class="cards">
    <h2 class="no-print">Lesson cards</h2>
${ALL_LESSONS.map(card).join("\n")}
  </section>
</main>
<script type="module">
  // Field Notes per world from this browser's passport; no network, no storage written.
  const fill = (w, text) => { const el = document.querySelector(\`[data-k2-notes="\${w}"]\`); if (el) el.textContent = text; };
  try {
    const { k2FieldNotes, k2AdaptLesson } = await import("../shared/field-kiosk.js");
    const { SM_FIELD_LESSONS } = await import("../shared/summit-data.js");
    const { RW_FIELD_LESSONS } = await import("../redwood/js/rw-lore-data.js");
    const own = { summit: SM_FIELD_LESSONS.map((l) => k2AdaptLesson(l, "summit")), redwood: RW_FIELD_LESSONS.map((l) => k2AdaptLesson(l, "redwood")) };
    for (const w of ${JSON.stringify(worlds)}) {
      const n = own[w] ? k2FieldNotes(w, own[w]) : k2FieldNotes(w);
      fill(w, \`\${n.done} of \${n.total} answered\${n.earned ? " — Field Notes badge earned" : \` (badge at \${n.need})\`}\`);
    }
  } catch (e) { for (const w of ${JSON.stringify(worlds)}) fill(w, "passport not readable here"); }
  const sel = document.getElementById("world-filter");
  sel.addEventListener("change", () => { for (const el of document.querySelectorAll("[data-world]")) el.hidden = !!sel.value && el.dataset.world !== sel.value; });
  document.getElementById("print-cards").addEventListener("click", () => window.print());
</script>
</body>
</html>
`;
mkdirSync(join(ROOT, "WebXR/k12"), { recursive: true });
writeFileSync(join(ROOT, "WebXR/k12/teacher.html"), page);
console.log(`wrote WebXR/k12/teacher.html — ${ALL_LESSONS.length} lessons, ${K12.length} programmes, ${worlds.length} worlds`);
void K2_WORLD_PAGES;
