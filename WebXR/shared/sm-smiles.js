// SMILES (console SMILES, docs/consoles/SMILES.md): the dental-health and hygiene games of the Unspoken Smiles District
// (np-data-sm-unspoken-smiles.js), on the shared side-game step shape (side-game-mechanics.js: a step is
// `{ board, prompt, options: [{ text, safe }] }`, exactly one move safe, nothing scored on speed).
//
// Facts rule. No line here is a new health claim. Every teaching line carries the station it comes from and a `quote`
// that is a verbatim substring of that station's own sim file (WebXR/smartcity/js/sims/<station>.js); an adult line is
// the quote itself, a K-12 line restates it at the reading ceiling using only words the station's own text uses
// (tools/check_smiles.mjs re-reads both). No digits anywhere.
//
// Kids rule. K-12 games sit only at the map's K-12 sites (`k12: true`), use short plain lines and no fear framing; the
// adult-only procedure (the sterilisation order) sits only at an adult site and is never offered in a K-12 session.
//
// Seams (all pure except smilesMount):
//   SMILES_MAP                         the map id this module plays on
//   SMILES_LINES                       [{ id, station, quote, text, band: "k12"|"adult" }]
//   SMILES_GAMES                       [{ id, title, site, audience: "k12"|"adult", station, lines, blurb }]
//   smilesGamesFor(parishId, { k12 })  the games offered on a map (adult ones left out for a K-12 session)
//   smilesSteps(gameId)                the game's steps, deterministic
//   smilesScore(gameId, picks)         → { correct, total, clean } for a list of chosen option indexes
//   smilesPay(gameId, picks, earn)     pays once through `earn(stationId, recordId)` (TYCOON's tyEarn) on a clean run
//   smilesMount({ el, parish, k12, toast, earn })   the Play-tab panel (only on the Unspoken Smiles map)
// Names are prefixed `smiles`/`SMILES_` (Sierra Summit already owns `SM_` in the bundler's one scope).

export const SMILES_MAP = "sm-unspoken-smiles";

const SMILES_OHI = "dn-oral-hygiene-instruction-and-motivational-interviewing";
const SMILES_PED = "pediatric-visit";
const SMILES_ICA = "infection-control-audit";
const SMILES_IRP = "instrument-reprocessing";

/** The teaching lines. `quote` re-reads verbatim in the station's sim file; `text` is what the player sees. */
export const SMILES_LINES = [
  // brushing coverage
  { id: "brush-tongue-side", station: SMILES_OHI, band: "k12", quote: "a thick band on the tongue side of the lower front teeth — the spot a rushed brush in the car never reaches", text: "The tongue side of the lower front teeth is the spot a rushed brush never reaches." },
  { id: "brush-back-molars", station: SMILES_OHI, band: "k12", quote: "plaque along the upper back molars", text: "Plaque can sit along the upper back molars, so the brush goes there too." },
  { id: "brush-soft", station: SMILES_OHI, band: "k12", quote: "A soft brush, because the bleeding gums need cleaning without being scrubbed", text: "A soft brush, because gums need cleaning without being scrubbed." },
  // floss the gaps
  { id: "floss-between", station: SMILES_OHI, band: "k12", quote: "show the in-and-out movement between two teeth", text: "Use the in-and-out movement between two teeth." },
  { id: "floss-model", station: SMILES_OHI, band: "k12", quote: "technique is shown on the model", text: "The technique is shown on the model first." },
  { id: "floss-goal", station: SMILES_OHI, band: "k12", quote: "A goal he sets is a goal he owns", text: "A goal you set is a goal you own." },
  // sugar sort
  { id: "sugar-chart", station: SMILES_PED, band: "k12", quote: "Snacking: frequent", text: "Snacking often goes on the caries risk chart." },
  { id: "sugar-diet-talk", station: SMILES_PED, band: "k12", quote: "Score the caries-risk chart with the parent, then go through the diet handout together", text: "The hygienist and the parent go through the diet handout together." },
  { id: "sugar-soft-foods", station: SMILES_PED, band: "k12", quote: "Walk the parent through soft foods and no brushing until the next morning", text: "After the varnish: soft foods and no brushing until the next morning." },
  // plaque attack
  { id: "plaque-dye", station: SMILES_OHI, band: "k12", quote: "The disclosing dye makes plaque visible", text: "The disclosing dye makes plaque visible." },
  { id: "plaque-gumline", station: SMILES_OHI, band: "k12", quote: "plaque at the gumline is what makes it bleed", text: "Look for plaque at the gumline." },
  // handwashing
  { id: "hands-soiled", station: SMILES_ICA, band: "k12", quote: "handwashing rather than an alcohol rub is what is required when hands are visibly soiled", text: "Handwashing is what is required when hands are visibly soiled." },
  { id: "hands-towel", station: SMILES_ICA, band: "k12", quote: "The towel is part of the hand hygiene procedure", text: "The towel is part of the hand hygiene procedure." },
  { id: "hands-dispenser", station: SMILES_ICA, band: "k12", quote: "An empty dispenser is a hand hygiene station that does not exist", text: "An empty dispenser is a hand hygiene station that does not exist." },
  // the sterilisation order (adult only): the station's own step titles, in the station's order
  { id: "st-gloves", station: SMILES_IRP, band: "adult", quote: "Don utility gloves for the dirty zone", text: "Don utility gloves for the dirty zone" },
  { id: "st-receive", station: SMILES_IRP, band: "adult", quote: "Receive the cassette in the dirty zone", text: "Receive the cassette in the dirty zone" },
  { id: "st-clean", station: SMILES_IRP, band: "adult", quote: "Clean instruments in the ultrasonic", text: "Clean instruments in the ultrasonic" },
  { id: "st-rinse", station: SMILES_IRP, band: "adult", quote: "Rinse the cleaned instruments", text: "Rinse the cleaned instruments" },
  { id: "st-inspect", station: SMILES_IRP, band: "adult", quote: "Inspect every instrument under magnification", text: "Inspect every instrument under magnification" },
  { id: "st-dry", station: SMILES_IRP, band: "adult", quote: "Dry instruments completely before packaging", text: "Dry instruments completely before packaging" },
  { id: "st-package", station: SMILES_IRP, band: "adult", quote: "Package with an internal indicator, then seal and date", text: "Package with an internal indicator, then seal and date" },
  { id: "st-load", station: SMILES_IRP, band: "adult", quote: "Load the autoclave without overlapping packs", text: "Load the autoclave without overlapping packs" },
  { id: "st-run", station: SMILES_IRP, band: "adult", quote: "Run the cycle", text: "Run the cycle" },
  { id: "st-printout", station: SMILES_IRP, band: "adult", quote: "Read the printout", text: "Read the printout" },
  { id: "st-external", station: SMILES_IRP, band: "adult", quote: "Check the external indicator", text: "Check the external indicator" },
  { id: "st-log", station: SMILES_IRP, band: "adult", quote: "Log the cycle and the spore test result", text: "Log the cycle and the spore test result" },
  { id: "st-storage", station: SMILES_IRP, band: "adult", quote: "Rotate sterile storage first-in-first-out", text: "Rotate sterile storage first-in-first-out" },
];
const smilesLine = (id) => SMILES_LINES.find((l) => l.id === id);

/** The games: where each sits, who it is for, the station it pays through and the lines it teaches. */
export const SMILES_GAMES = [
  { id: "smiles-brushing-coverage", title: "Every Surface", site: "sm-school-brushing-station", audience: "k12", station: SMILES_OHI,
    blurb: "Brush every surface: find the spot the brush has missed.", lines: ["brush-tongue-side", "brush-back-molars", "brush-soft"] },
  { id: "smiles-floss-the-gaps", title: "Floss the Gaps", site: "sm-community-centre", audience: "k12", station: SMILES_OHI,
    blurb: "Clean between the teeth the way the hygienist shows on the model.", lines: ["floss-model", "floss-between", "floss-goal"] },
  { id: "smiles-sugar-sort", title: "Snack Sort", site: "sm-healthy-food-market", audience: "k12", station: SMILES_PED,
    blurb: "Sort the cards the hygienist reads onto the caries risk chart.", lines: ["sugar-chart", "sugar-diet-talk", "sugar-soft-foods"] },
  { id: "smiles-plaque-attack", title: "Plaque Attack", site: "sm-smile-park", audience: "k12", station: SMILES_OHI,
    blurb: "The dye shows the plaque: tap the coloured spots.", lines: ["plaque-dye", "plaque-gumline", "brush-back-molars"] },
  { id: "smiles-handwashing", title: "Clean Hands", site: "sm-water-fountain-plaza", audience: "k12", station: SMILES_ICA,
    blurb: "Check the hand hygiene station before anyone uses it.", lines: ["hands-soiled", "hands-towel", "hands-dispenser"] },
  { id: "smiles-sterilisation-order", title: "The Sterilisation Order", site: "sm-sterilisation-centre", audience: "adult", station: SMILES_IRP,
    blurb: "Adult training: put the reprocessing steps in the station's order, from the dirty zone to sterile storage.",
    lines: ["st-gloves", "st-receive", "st-clean", "st-rinse", "st-inspect", "st-dry", "st-package", "st-load", "st-run", "st-printout", "st-external", "st-log", "st-storage"] },
];
export const smilesGame = (id) => SMILES_GAMES.find((g) => g.id === id) ?? null;

function smilesHash(s) { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
function smilesStep(id, i, board, prompt, safe, unsafe, teach) {
  const flip = ((smilesHash(id) >> (i + 3)) & 1) === 1;
  const a = { text: safe, safe: true }, b = { text: unsafe, safe: false };
  return { board, prompt, options: flip ? [b, a] : [a, b], teach };
}

/** Each game's moves (the unsafe move is always a plain miss, never a harm). */
const SMILES_BUILD = {
  "smiles-brushing-coverage": (g) => [
    smilesStep(g.id, 0, ["Outer sides: brushed", "Chewing tops: brushed", "Tongue side, lower front teeth: not yet"], "Which spot still needs the brush?", "The tongue side of the lower front teeth", "The outer sides again", smilesLine("brush-tongue-side").text),
    smilesStep(g.id, 1, ["Front teeth: brushed", "Upper back molars: not yet"], "Where does the brush go next?", "Along the upper back molars", "Stop now, the front looks clean", smilesLine("brush-back-molars").text),
    smilesStep(g.id, 2, ["Two brushes in the cup: a soft one and a hard one"], "Which brush for the gums?", "The soft brush", "The hard brush, scrubbed hard", smilesLine("brush-soft").text),
  ],
  "smiles-floss-the-gaps": (g) => [
    smilesStep(g.id, 0, ["A teaching model of the teeth on the table"], "Where does the hygienist show the technique first?", "On the model", "Nowhere, just guess", smilesLine("floss-model").text),
    smilesStep(g.id, 1, ["Two teeth side by side on the model, a gap between them"], "How does the interdental brush move?", "In and out between the two teeth", "Only across the front", smilesLine("floss-between").text),
    smilesStep(g.id, 2, ["A goal card and a pen"], "Who picks the goal?", "You pick your own goal", "Someone else picks it for you", smilesLine("floss-goal").text),
  ],
  "smiles-sugar-sort": (g) => [
    smilesStep(g.id, 0, ["The caries risk chart", "Cards: Snacking often · Favourite colour"], "Which card goes on the chart?", "Snacking often", "Favourite colour", smilesLine("sugar-chart").text),
    smilesStep(g.id, 1, ["The chart is done", "The diet handout is on the table"], "What happens next?", "The hygienist and the parent read the diet handout together", "The handout is put away unread", smilesLine("sugar-diet-talk").text),
    smilesStep(g.id, 2, ["The varnish is on", "Cards: Soft foods · Brush it off tonight"], "Which card goes home?", "Soft foods, and no brushing until the next morning", "Brush it off tonight", smilesLine("sugar-soft-foods").text),
  ],
  "smiles-plaque-attack": (g) => [
    smilesStep(g.id, 0, ["The disclosing dye is on", "Coloured spots appear"], "What do the coloured spots show?", "Plaque, made visible by the dye", "Nothing, ignore them", smilesLine("plaque-dye").text),
    smilesStep(g.id, 1, ["A coloured line where the tooth meets the gum"], "Where do you tap?", "The plaque at the gumline", "The clean tip of the tooth", smilesLine("plaque-gumline").text),
    smilesStep(g.id, 2, ["Coloured spots along the upper back molars"], "Tap the last spots", "Along the upper back molars", "Skip the back of the mouth", smilesLine("brush-back-molars").text),
  ],
  "smiles-handwashing": (g) => [
    smilesStep(g.id, 0, ["Hands that look soiled", "A sink with soap · a bottle of rub"], "What do visibly soiled hands need?", "Handwashing at the sink", "Just a quick rub", smilesLine("hands-soiled").text),
    smilesStep(g.id, 1, ["Hands washed and wet", "A towel on the hook"], "What comes next?", "Dry with the towel", "Shake them and touch the tap", smilesLine("hands-towel").text),
    smilesStep(g.id, 2, ["The soap dispenser is empty"], "What do you do?", "Tell a grown-up so it gets filled", "Walk past it", smilesLine("hands-dispenser").text),
  ],
  "smiles-sterilisation-order": (g) => g.lines.slice(0, -1).map((id, i) => {
    const later = g.lines[Math.min(g.lines.length - 1, i + 2 + (smilesHash(g.id + i) % 3))];
    return smilesStep(g.id, i, [`Done so far: ${i === 0 ? "nothing yet" : smilesLine(g.lines[i - 1]).text}`], "Which step comes next?", smilesLine(id).text, smilesLine(later).text, smilesLine(id).text);
  }),
};

/** The games offered on a map: none off the Unspoken Smiles map; the adult ones left out of a K-12 session. */
export function smilesGamesFor(parishId, { k12 = false } = {}) {
  if (parishId !== SMILES_MAP) return [];
  return SMILES_GAMES.filter((g) => !(k12 && g.audience === "adult"));
}
/** A game's steps (deterministic). */
export function smilesSteps(gameId) { const g = smilesGame(gameId); return g ? SMILES_BUILD[g.id](g) : []; }
/** Score a run: `picks` are the chosen option indexes, one per step. Clean only when every move was the safe one. */
export function smilesScore(gameId, picks = []) {
  const steps = smilesSteps(gameId);
  const correct = steps.filter((s, i) => s.options[picks[i]]?.safe).length;
  return { correct, total: steps.length, clean: steps.length > 0 && correct === steps.length };
}
const smilesPaid = new Set();
/** Pay once per game on a clean run through `earn(stationId, recordId)` (TYCOON's tyEarn keys by record id as well). */
export function smilesPay(gameId, picks, earn) {
  const s = smilesScore(gameId, picks), g = smilesGame(gameId);
  if (!g || !s.clean || smilesPaid.has(gameId)) return { ...s, paid: false };
  smilesPaid.add(gameId);
  let r = null; try { r = earn?.(g.station, `smiles:${gameId}`) ?? null; } catch { r = null; }
  return { ...s, paid: r ? r.paid !== false && !r.duplicate : true };
}

/** The Play-tab panel: a list of the map's games, each played step by step. Renders nothing off the map. */
export function smilesMount({ el, parish, k12 = false, toast = () => {}, earn = null } = {}) {
  if (!el || typeof document === "undefined") return null;
  const games = smilesGamesFor(parish?.id, { k12 });
  if (!games.length) { el.hidden = true; return { games }; }
  const siteName = (id) => parish.sites?.find((s) => s.id === id)?.name ?? id;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let game = null, steps = [], picks = [];
  function list() {
    el.innerHTML = `<p class="ux-sub">Unspoken Smiles games (a procedural district)</p>` + games.map((g) =>
      `<button class="btn" type="button" data-smiles="${g.id}">${esc(g.title)}${g.audience === "adult" ? " (adult training)" : ""}<br><small>${esc(siteName(g.site))}</small></button>`).join("");
    el.querySelectorAll("[data-smiles]").forEach((b) => b.addEventListener("click", () => start(b.dataset.smiles)));
  }
  function start(id) { game = smilesGame(id); steps = smilesSteps(id); picks = []; draw(); }
  function draw() {
    const i = picks.length;
    if (i >= steps.length) {
      const r = smilesPay(game.id, picks, earn);
      el.innerHTML = `<p><b>${esc(game.title)}</b>: ${r.correct} of ${r.total}${r.clean ? " — a clean run" : ""}.</p><button class="btn" type="button" data-back>Back to the games</button>`;
      el.querySelector("[data-back]").addEventListener("click", list);
      if (r.paid) toast(`${game.title}: Crew Credits earned (a play currency).`);
      return;
    }
    const s = steps[i];
    el.innerHTML = `<p><b>${esc(game.title)}</b></p><ul>${s.board.map((b) => `<li>${esc(b)}</li>`).join("")}</ul><p>${esc(s.prompt)}</p>` +
      s.options.map((o, k) => `<button class="btn" type="button" data-pick="${k}">${esc(o.text)}</button>`).join("");
    el.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
      const k = Number(b.dataset.pick); picks.push(k); toast(s.teach, 4200); draw();
    }));
  }
  list();
  return { games, start, list };
}
