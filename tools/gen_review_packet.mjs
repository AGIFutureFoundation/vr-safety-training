/**
 * Generates the practitioner review packet — WebXR/smartcity/REVIEW.md —
 * one section per station and room: the trade, the union and certification
 * it claims, every step with its rationale, every seeded hazard with its
 * consequence text, and a sign-off block. This is what a qualified
 * practitioner in each trade reviews before any record from that station is
 * treated as evidence of readiness; the ledger names that review as the
 * next step and this is the document it happens on.
 *
 * Each section also carries an AUTOMATED PREVIEW verdict: the content checks
 * a machine can make (a real category, trade and certification are named;
 * every step has a rationale; every hazard has a consequence a reviewer can
 * judge; every late note points at a real target; the scene builds inside
 * the headset mesh budget; every dossier statement has a source). A passed
 * preview is a precondition for review, never a substitute for it: the
 * practitioner sign-off block stays empty until a named person signs it.
 * The same verdicts are written to WebXR/smartcity/review-preview.json so a
 * portal or platform can show "preview passed / sign-off pending" per
 * station.
 *
 *     node tools/gen_review_packet.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";

const city = await loadSmartCity();
const trades = await loadTrades();
const OUT = join(WEBXR, "smartcity", "REVIEW.md");
const OUT_JSON = join(WEBXR, "smartcity", "review-preview.json");
const MESH_BUDGET = 320;
const TODAY = new Date().toISOString().slice(0, 10);

const kindWord = { select: "Select", sequence: "Sequence", find: "Find", gauge: "Graded reading", hold: "Timed hold", track: "Tracked hold", turn: "Turn", drag: "Carry and place" };
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");

function stepTargets(s) { return s.kind === "sequence" || s.kind === "find" ? s.targets ?? [] : s.target ? [s.target] : []; }

/** The machine-checkable half of a review. Returns [{check, ok, note}]. */
function preview(suite, app, r) {
  const out = [];
  const add = (check, ok, note = "") => out.push({ check, ok: !!ok, note });
  add("Category named", !!r.category || app === "trades", r.category ?? (app === "trades" ? "Trade Skills Simulator" : "missing"));
  add("Trade named", !!r.trade, r.trade ?? "missing");
  add("Certification or standard named", !!r.certification, r.certification ?? "missing");
  add("At least three scored steps", r.steps.length >= 3, `${r.steps.length} steps`);
  const thinWhy = r.steps.filter((s) => !s.why || String(s.why).trim().length < 20).map((s) => s.id);
  add("Every step has a rationale", thinWhy.length === 0, thinWhy.length ? `missing or thin: ${thinWhy.join(", ")}` : `${r.steps.length} rationales`);
  const hz = Object.entries(r.hazards ?? {});
  add("At least one seeded hazard", hz.length >= 1, `${hz.length} hazards`);
  const thinHz = hz.filter(([, t]) => String(t).trim().length < 40).map(([id]) => id);
  add("Every hazard has a judgeable consequence", thinHz.length === 0, thinHz.length ? `thin: ${thinHz.join(", ")}` : "all ≥ 40 characters");
  const owned = new Set(r.steps.flatMap(stepTargets));
  const strayNotes = Object.keys(r.lateNotes ?? {}).filter((id) => !owned.has(id));
  add("Late notes point at real targets", strayNotes.length === 0, strayNotes.length ? `stray: ${strayNotes.join(", ")}` : `${Object.keys(r.lateNotes ?? {}).length} notes`);
  if (r.flat) {
    const unsourced = (r.dossier ?? []).filter((d) => !d.source?.url).map((d) => d.title);
    add("Every dossier statement is sourced", (r.dossier?.length ?? 0) > 0 && unsourced.length === 0, unsourced.length ? `unsourced: ${unsourced.join(", ")}` : `${r.dossier?.length ?? 0} sourced statements`);
    const optionless = r.steps.filter((s) => !s.options?.length).map((s) => s.id);
    add("Every knowledge-check step has options", optionless.length === 0, optionless.length ? `no options: ${optionless.join(", ")}` : "ok");
  } else {
    let meshes = null, hits = null, err = null;
    try {
      const root = new suite.THREE.Group();
      const api = r.build(root);
      meshes = 0; root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshes += 1; });
      hits = api?.hits ?? {};
    } catch (e) { err = e; }
    add("Scene builds headless", !err, err ? String(err.message ?? err) : `${meshes} meshes`);
    add(`Within headset mesh budget (${MESH_BUDGET})`, meshes !== null && meshes <= MESH_BUDGET, meshes === null ? "not built" : `${meshes} meshes`);
    const missing = hits ? [...owned].filter((id) => !hits[id]) : [...owned];
    add("Every step target exists in the scene", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${owned.size} targets`);
  }
  return out;
}

function section(app, r, checks) {
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const lines = [];
  lines.push(`## ${r.name ?? r.title} (${app === "smartcity" ? "SmartCiti.X" : "Trade Skills"} · \`${r.id}\`)`);
  lines.push("");
  lines.push(`**Category:** ${r.category ?? (app === "trades" ? "Trade Skills Simulator" : "—")}  `);
  lines.push(`**Trade:** ${r.trade ?? "—"}  `);
  if (r.union) lines.push(`**Union:** ${r.union}  `);
  lines.push(`**Certification / standard claimed:** ${r.certification ?? "—"}  `);
  lines.push(`**Tagline:** ${r.tagline ?? "—"}  `);
  lines.push(`**Automated preview:** ${allOk ? "✅ passed" : "❌ FAILED"} ${passed}/${checks.length} checks on ${TODAY} · **Practitioner sign-off:** ☐ pending`);
  if (r.flat) lines.push("\n_Flat briefing station: a sourced dossier and knowledge check, no walkable scene._");
  lines.push("");
  lines.push("### Procedure as simulated");
  lines.push("");
  lines.push("| # | Step | Kind | Rationale shown to the learner | Reviewer: correct? |");
  lines.push("|---|---|---|---|---|");
  r.steps.forEach((s, i) => {
    const kind = kindWord[s.kind] ?? s.kind;
    const detail = s.kind === "sequence" || s.kind === "find" ? ` (${s.anyOrder || s.kind === "find" ? "any order" : "strict order"}: ${s.targets.map((t) => s.itemNames?.[t] ?? t).join(", ")})` : "";
    lines.push(`| ${i + 1} | ${esc(s.title)} | ${kind}${esc(detail)} | ${esc(s.why)} | ☐ yes ☐ no — |`);
  });
  lines.push("");
  lines.push("### Seeded hazards (unsafe actions)");
  lines.push("");
  lines.push("| Hazard | Consequence shown to the learner | Reviewer: realistic? |");
  lines.push("|---|---|---|");
  for (const [id, text] of Object.entries(r.hazards ?? {})) lines.push(`| \`${id}\` | ${esc(text)} | ☐ yes ☐ no — |`);
  if (r.dossier?.length) {
    lines.push("");
    lines.push("### Dossier sources");
    lines.push("");
    for (const d of r.dossier) {
      lines.push(`- **${d.title}** — ${d.source?.label ?? ""}${d.source?.url ? ` <${d.source.url}>` : ""}${d.source2 ? `; ${d.source2.label} <${d.source2.url}>` : ""}`);
    }
  }
  lines.push("");
  lines.push("### Automated preview (machine checks, not a practitioner verdict)");
  lines.push("");
  lines.push("| Check | Result | Note |");
  lines.push("|---|---|---|");
  for (const c of checks) lines.push(`| ${c.check} | ${c.ok ? "✅ pass" : "❌ fail"} | ${esc(c.note)} |`);
  lines.push("");
  lines.push(`_Preview signed by \`tools/gen_review_packet.mjs\` on ${TODAY}. It confirms the section is complete and consistent enough to review; it says nothing about whether the procedure is right. That is the practitioner's call below._`);
  lines.push("");
  lines.push("### Reviewer sign-off");
  lines.push("");
  lines.push("| Field | Entry |");
  lines.push("|---|---|");
  lines.push("| Reviewer name and qualification | |");
  lines.push("| Union / employer / training centre | |");
  lines.push("| Date | |");
  lines.push("| Verdict | ☐ Approved as evidence of readiness ☐ Approved with changes below ☐ Not approved |");
  lines.push("| Required changes | |");
  lines.push("");
  return lines.join("\n");
}

const all = [...city.ROOMS.map((r) => ["smartcity", r, city]), ...trades.ROOMS.map((r) => ["trades", r, trades])];
const results = all.map(([app, r, suite]) => ({ app, r, checks: preview(suite, app, r) }));
const byCategory = new Map();
for (const res of results) { const c = res.r.category ?? (res.app === "trades" ? "Trade Skills Simulator" : "Uncategorized"); if (!byCategory.has(c)) byCategory.set(c, []); byCategory.get(c).push(res); }
const previewPassed = results.filter((x) => x.checks.every((c) => c.ok)).length;

const head = `# Practitioner review packet — SmartCiti.X ~VR Simulators and Trade Skills Simulator

_Generated by \`node tools/gen_review_packet.mjs\` from the station modules; regenerate after any content change. Do not edit by hand — record verdicts in the sign-off tables and commit, or transcribe them to the tracking system._

**Purpose.** Every station here states a real union trade and a real certification or standard, and scores a learner against an ordered procedure with seeded hazards. Before any training record from a station is treated as evidence of readiness for that certification, a qualified practitioner in the trade reviews the station: is the order of operations right, is every rationale true, is every hazard's consequence realistic, and is the certification claim the right one? This packet is the review document. One section per station, with a sign-off block.

**Two signatures per section.** The first is automated and already present: a *preview* verdict from the generator confirming the section is complete and internally consistent (category, trade and certification named; a rationale on every step; a judgeable consequence on every hazard; late notes on real targets; the scene builds inside the headset mesh budget; every dossier statement sourced). The second is the practitioner's, and it is blank until a named person signs it. A preview pass is the entry ticket to review, not a stand-in for it.

**How to review.** Play the station once (\`smartcity/index.html?sim=<id>\` or \`trades/index.html?room=<id>\`), then work down its tables. Mark each step's rationale and each hazard's consequence yes or no with a note. Sign the block. A station with any "no" is not approved until the change is made and the section regenerated.

**Roster.** ${all.length} stations and rooms across ${byCategory.size} categories. Automated preview passed on ${previewPassed}/${all.length} on ${TODAY}. Practitioner sign-off: 0/${all.length}.

## Preview status

| Station | App | Category | Preview | Sign-off |
|---|---|---|---|---|
${results.map(({ app, r, checks }) => `| ${r.name ?? r.title} (\`${r.id}\`) | ${app === "smartcity" ? "SmartCiti.X" : "Trade Skills"} | ${r.category ?? "Trade Skills Simulator"} | ${checks.every((c) => c.ok) ? "✅ passed" : "❌ failed"} ${checks.filter((c) => c.ok).length}/${checks.length} | ☐ pending |`).join("\n")}

`;
const toc = [...byCategory.entries()].map(([c, list]) => `- **${c}** — ${list.map(({ r }) => r.name ?? r.title).join(", ")}`).join("\n");
const body = [...byCategory.entries()].map(([c, list]) => `# ${c}\n\n` + list.map(({ app, r, checks }) => section(app, r, checks)).join("\n---\n\n")).join("\n\n");
writeFileSync(OUT, head + toc + "\n\n---\n\n" + body + "\n");
writeFileSync(OUT_JSON, JSON.stringify({
  generatedAt: TODAY, meshBudget: MESH_BUDGET, total: all.length, previewPassed, practitionerSigned: 0,
  note: "preview = automated content checks by tools/gen_review_packet.mjs; practitioner = a named reviewer's verdict recorded in REVIEW.md",
  stations: results.map(({ app, r, checks }) => ({ id: r.id, app, name: r.name ?? r.title, category: r.category ?? "Trade Skills Simulator", preview: checks.every((c) => c.ok) ? "passed" : "failed", checks, practitioner: "pending" })),
}, null, 2) + "\n");
console.log(`Wrote ${OUT.replace(ROOT + "/", "")} and ${OUT_JSON.replace(ROOT + "/", "")} (${all.length} sections, ${byCategory.size} categories, preview passed ${previewPassed}/${all.length})`);
if (previewPassed !== all.length) { for (const { r, checks } of results) for (const c of checks) if (!c.ok) console.log(`  ✗ ${r.id}: ${c.check} — ${c.note}`); process.exitCode = 1; }
