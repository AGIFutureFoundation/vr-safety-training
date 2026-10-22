// ROBO-ARENA: the read-only "Robot arena" panel (docs/consoles/ROBO-ARENA.md). It renders docs/evals/arena.json as
// static HTML — the leaderboard with 95% intervals and per-scenario bars — for the robotics programme page, which
// tools/gen_robotics_programme.mjs writes. No script runs on the page for it, nothing is fetched, and nothing is re-run:
// every figure is the measured file's. SmartCiti.X Holodeck · Powered by AGI Corp.
//
//   raPanelHtml(arena) -> "<section id=\"arena\">…</section>"      RA_PANEL_CSS (the panel's styles, design tokens only)
// Every top-level name starts with `ra`/`RA_`.

const raEsc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const raPct = (x) => `${Math.round((x ?? 0) * 1000) / 10}%`;
const raPct2 = (x) => raPct(x).replace("-", "−");
/** An interval: "a–b" when both ends are non-negative, "a to b" (with true minus signs) when either is negative. */
const raCi = (ci) => (!ci ? "" : ci[0] < 0 || ci[1] < 0 ? `${raPct2(ci[0])} to ${raPct2(ci[1])}` : `${raPct(ci[0])}–${raPct(ci[1])}`);

export const RA_PANEL_CSS = `
  .ra-lead { display: grid; gap: var(--at-sp-3); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin: var(--at-sp-3) 0; }
  .ra-stat { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); }
  .ra-stat b { display: block; font-size: var(--at-fs-xl); font-variant-numeric: tabular-nums; }
  .ra-grid { display: grid; gap: var(--at-sp-3); grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: var(--at-sp-3); }
  .ra-sc, .ra-card { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); min-width: 0; }
  .ra-card h3 { margin: 0 0 var(--at-sp-2); font-size: var(--at-fs-sm); } .ra-card p, .ra-promoted { margin: 0 0 var(--at-sp-2); font-size: var(--at-fs-sm); overflow-wrap: anywhere; }
  .ra-sc h3 { margin: 0 0 var(--at-sp-2); font-size: var(--at-fs-sm); }
  .ra-bar { display: grid; grid-template-columns: 7.5em 1fr 3.2em; gap: var(--at-sp-2); align-items: center; font-size: var(--at-fs-xs); min-height: 18px; }
  .ra-track { height: 10px; border-radius: 5px; background: var(--at-surface-2); overflow: hidden; }
  .ra-fill { display: block; height: 100%; background: var(--at-primary); border-radius: 5px; }
  .ra-bar[data-ra-model="ra-lm"] .ra-fill { background: var(--at-secondary); }
  .ra-bar[data-ra-model="expert"] .ra-fill { background: var(--at-on-surface-dim); }
  .ra-na { color: var(--at-on-surface-muted); }
  .ra-bar .num { text-align: right; font-variant-numeric: tabular-nums; }
`;

/** The panel as one static section. `arena` is docs/evals/arena.json. */
/** A signed difference with its interval, as the cards print it ("−6.7% (95% −15.2% to 1.8%)"). */
const raDiffTxt = (d) => (!d ? "—" : `${d.diff > 0 ? "+" : ""}${raPct2(d.diff)} (95% ${raCi(d.ci95)})`);

/**
 * The round-7 and protocol-3 cards (static HTML from arena.json retest7 / retest8), and the claw's promoted model per
 * scenario, read from the claw's own latest record (docs/evals/claw3.json or earlier). Nothing here re-runs anything.
 */
export function raRetestCardsHtml(arena, claw = null) {
  const out = [];
  const r7 = arena?.retest7?.comparisons;
  if (r7) {
    const h = r7.headline, c = r7.changeOnGaps, cs = r7.cobotStation ?? {};
    out.push(`<div class="ra-card" data-ra-card="retest7"><h3>Round 7 retest <span class="rp-muted">· seeds ${raEsc(arena.retest7.seeds?.gym ?? "7181–7240")}, declared first</span></h3>
      <p data-ra-fig="headline">ra-lm-h − bc on the two declared gaps (AMR + port): <b>${raDiffTxt(h?.diff)}</b>. The interval spans 0, so no difference is claimed.</p>
      <p data-ra-fig="change">The change (one hidden layer), ra-lm-h − ra-lm on the same seeds: <b>${raDiffTxt(c?.diff)}</b>.</p>
      <p data-ra-fig="cobot">Cobot station: ra-lm ${raEsc(cs["ra-lm"] ?? "—")} → ra-lm-h ${raEsc(cs["ra-lm-h"] ?? "—")} (bc ${raEsc(cs.bc ?? "—")}).</p></div>`);
  }
  const r8 = arena?.retest8;
  if (r8) {
    const d = r8.comparisons ?? {}, pr = r8.promotions ?? [];
    const amr = d.amrHeadline, ch = d.changeOnAmr, rh = d.reactiveHardPooled, lp = d.lmHPort;
    const span = (x) => (x && x.ci95[0] <= 0 && x.ci95[1] >= 0 ? " The interval spans 0, so no difference is claimed." : "");
    out.push(`<div class="ra-card" data-ra-card="protocol3"><h3>Protocol 3 <span class="rp-muted">· seeds ${raEsc(r8.seeds)}, declared ${raEsc(r8.declared?.commit ?? "")} before the run, run once by the claw</span></h3>
      <p data-ra-fig="amr">The AMR change (ra-lm-h48, 48 hidden units) − bc on AMR base: <b>${raDiffTxt(amr)}</b>.${span(amr)} Against ra-lm-h on the same seeds: ${raDiffTxt(ch)}.</p>
      <p data-ra-fig="port">ra-lm-h − bc on port base: <b>${raDiffTxt(lp)}</b>.${span(lp)}</p>
      <p data-ra-fig="reactive">The reactive rule policy (hand-written, not trained) − bc on the three hard variants pooled: <b>${raDiffTxt(rh)}</b>.</p>
      <p data-ra-fig="promotions">Promotions through the claw's gate: ${pr.length ? pr.map((x) => `<code>${raEsc(x.to)}</code> on ${raEsc(x.scenarioId)}`).join(", ") : "none"}. Steps the governor checked ${r8.totals?.stepsChecked ?? "—"} / ${r8.totals?.stepsRun ?? "—"}; physical ${r8.totals?.physical ?? "—"}.</p></div>`);
  }
  return out.length ? `<h3>Declared retests</h3>\n    <div class="ra-grid ra-cards">\n      ${out.join("\n      ")}\n    </div>` : "";
}

/** The claw's model for a scenario: promoted in its latest record, else that record's incumbent. Null when the claw has no run there. */
export function raClawModelFor(claw, sc) {
  if (!claw?.runs?.some((r) => r.scenarioId === sc)) return null;
  const to = claw.promoted?.[sc] ?? null;
  const run = claw.runs.find((r) => r.scenarioId === sc);
  const id = to ?? claw.protocol?.incumbent ?? "bc";
  const x = run.results.find((y) => y.modelId === id) ?? null;
  return { modelId: id, promoted: !!to, k: x?.k ?? null, n: x?.n ?? null, ci: x?.ci ?? null, protocol: claw.protocol?.version ?? "" };
}

export function raPanelHtml(arena, { claw = null } = {}) {
  if (!arena?.leaderboard) return `<section aria-labelledby="h-arena" id="arena" data-ra-arena="missing"><h2 id="h-arena">Robot arena</h2><p class="rp-muted">No arena results in this build (node tools/arena_eval.mjs).</p></section>`;
  const fam = Object.fromEntries((arena.models ?? []).map((m) => [m.id, m.family]));
  const lb = arena.leaderboard.gym ?? [];
  const rows = lb.map((r) => `<tr data-ra-row="${raEsc(r.modelId)}"><td class="num">${r.rank}</td><td><code>${raEsc(r.modelId)}</code><br><span class="rp-muted">${raEsc(fam[r.modelId] ?? "")}</span></td><td class="num">${r.scenarios}</td><td class="num">${raPct(r.success)}</td><td class="num">${raCi(r.ci95)}</td><td class="num">${r.ruleBreaks}</td><td class="num">${r.stops}</td><td class="num">${r.meanSteps}</td><td class="num">${raPct(r.governorChecked)}</td></tr>`).join("\n        ");
  const order = lb.map((r) => r.modelId).concat((arena.models ?? []).map((m) => m.id).filter((id) => !lb.some((r) => r.modelId === id)));
  const by = new Map((arena.results ?? []).map((r) => [`${r.modelId}|${r.scenarioId}`, r]));
  const cards = (arena.scenarios ?? []).map((sc) => {
    const bars = order.map((id) => {
      const r = by.get(`${id}|${sc.id}`);
      if (!r || !r.applicable) return `<div class="ra-bar" data-ra-model="${raEsc(id)}"><span>${raEsc(id)}</span><span class="ra-na">not applicable</span><span class="num ra-na">—</span></div>`;
      return `<div class="ra-bar" data-ra-model="${raEsc(id)}" title="${raEsc(`${id}: ${raPct(r.success)} of ${r.n} seeds, ${r.ruleBreaks} rule breaks, ${r.stops} governor stops`)}"><span>${raEsc(id)}</span><span class="ra-track" role="img" aria-label="${raEsc(`${id} ${raPct(r.success)}`)}"><span class="ra-fill" style="width:${Math.round(r.success * 1000) / 10}%"></span></span><span class="num">${raPct(r.success)}</span></div>`;
    }).join("");
    const cm = raClawModelFor(claw, sc.id);
    const pm = cm ? `<p class="ra-promoted" data-ra-promoted="${raEsc(cm.modelId)}">${cm.promoted ? "Promoted by the claw" : "Kept by the claw (no challenger cleared the gate)"} (${raEsc(cm.protocol)}): <code>${raEsc(cm.modelId)}</code>, ${cm.k}/${cm.n} (95% ${raCi(cm.ci)})</p>` : `<p class="ra-promoted rp-muted" data-ra-promoted="none">Not under the claw: the claw runs the gym scenarios only.</p>`;
    return `<div class="ra-sc" data-ra-scenario="${raEsc(sc.id)}"><h3>${raEsc(sc.name ?? sc.id)} <span class="rp-muted">· ${raEsc(sc.kind)}${sc.hard ? " · held-out task" : ""}</span></h3>${pm}${bars}</div>`;
  }).join("\n      ");
  const sm = arena.smallModel ?? {}, ht = sm.heldOutTasks ?? {}, hs = sm.heldOutSeeds ?? {};
  const t = arena.totals ?? {};
  return `<section aria-labelledby="h-arena" id="arena" data-ra-arena="${raEsc(arena.version)}">
    <div class="at-section-head"><div><h2 id="h-arena">Robot arena</h2><p>Every robot model built in this platform runs the same simulated scenarios on the same held-out seeds (${raEsc(arena.seeds?.gym)}; stations ${raEsc(arena.seeds?.stations)}), and the safety governor watches every step. Read-only: these are the measured results in <code>docs/evals/arena.json</code>, not a live run. Robots are simulated; no result here is a claim about a real robot.</p></div></div>
    <div class="ra-lead">
      <div class="ra-stat"><span class="rp-muted">Model families</span><b>${t.families ?? "—"}</b><span class="rp-muted">on ${t.scenarios ?? "—"} scenarios, ${t.episodes ?? "—"} episodes</span></div>
      <div class="ra-stat"><span class="rp-muted">Steps the governor checked</span><b>${t.stepsChecked ?? "—"} / ${t.stepsRun ?? "—"}</b><span class="rp-muted">physical dispatches: ${t.physical ?? "—"}</span></div>
      <div class="ra-stat" data-ra-lm><span class="rp-muted">Small model vs the clone, held-out tasks</span><b>${raPct(ht.lm?.success)} vs ${raPct(ht.bc?.success)}</b><span class="rp-muted">difference ${ht.lmMinusBc ? `${ht.lmMinusBc.diff > 0 ? "+" : ""}${raPct2(ht.lmMinusBc.diff)} (95% ${raCi(ht.lmMinusBc.ci95)})` : "—"}</span></div>
    </div>
    <p class="rp-muted"><strong>${raEsc(sm.label ?? "")}</strong> — ${sm.params ?? "?"} weights, trained here on synthetic demonstrations and the stations' own step and hazard texts. Over every scenario it scored ${raPct(hs.lm?.success)} against the clone's ${raPct(hs.bc?.success)} (difference ${hs.lmMinusBc ? `${raPct2(hs.lmMinusBc.diff)}, 95% ${raCi(hs.lmMinusBc.ci95)}` : "—"}); with its instruction text blanked, ${raPct(hs.blankText?.success)}. Reported as measured.</p>
    <h3>Leaderboard — the nine gym scenarios</h3>
    <div class="rp-scroll"><table class="rp-table" data-ra-leaderboard>
      <thead><tr><th scope="col" class="num">Rank</th><th scope="col">Model</th><th scope="col" class="num">Scenarios</th><th scope="col" class="num">Success</th><th scope="col" class="num">95% interval</th><th scope="col" class="num">Rule breaks</th><th scope="col" class="num">Governor stops</th><th scope="col" class="num">Mean steps</th><th scope="col" class="num">Steps checked</th></tr></thead>
      <tbody>
        ${rows}
      </tbody>
    </table></div>
    <p class="rp-muted">Success pools every seed of every scenario a model applies to (the reactive agent exists only where rules were written for it; DAgger and the per-step-reward clone are gym-only). Intervals are Wilson 95%. A broken safe-practice rule halts the run with a governor stop. The scripted expert is an upper bound, not a learner; DAgger's corrections are the scripted expert's, not a person's.</p>
    ${raRetestCardsHtml(arena, claw)}
    <h3>Per scenario</h3>
    <div class="ra-grid">
      ${cards}
    </div>
  </section>`;
}
