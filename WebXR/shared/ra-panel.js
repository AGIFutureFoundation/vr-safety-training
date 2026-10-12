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
  .ra-sc { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); min-width: 0; }
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
export function raPanelHtml(arena) {
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
    return `<div class="ra-sc" data-ra-scenario="${raEsc(sc.id)}"><h3>${raEsc(sc.name ?? sc.id)} <span class="rp-muted">· ${raEsc(sc.kind)}${sc.hard ? " · held-out task" : ""}</span></h3>${bars}</div>`;
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
    <h3>Per scenario</h3>
    <div class="ra-grid">
      ${cards}
    </div>
  </section>`;
}
