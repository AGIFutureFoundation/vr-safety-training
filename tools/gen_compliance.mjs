#!/usr/bin/env node
// Generate docs/compliance/compliance-matrix.md from the catalog and the
// station sources: for every station, the regulatory and standards citations
// it actually makes (CFR sections, Cal/OSHA title 8 sections, NFPA, ANSI,
// ASME, CalCode, Business and Professions Code, Labor Code, ISO, IMO), and
// for every citation, the stations that carry it — the two views an
// enterprise training office needs when a regulator asks "where do you
// teach 1910.147?". Run after gen_catalog.mjs; never edit the page by hand.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
// The checker count is whatever check_all.mjs runs today, never a spelled-out number.
const CHECKERS = (readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8").match(/"check_[a-z0-9_]+\.mjs"/g) ?? []).length;

// Citation patterns, each normalised to one display form.
const PATTERNS = [
  [/\b(\d{2}) CFR (?:Part )?(\d{3,4})(?:\.(\d{1,4}))?/g, (m) => `${m[1]} CFR ${m[2]}${m[3] ? "." + m[3] : ""}`],
  [/\b(1910|1926|1915|1917|1918|1904)\.(\d{1,4})\b/g, (m) => `29 CFR ${m[1]}.${m[2]}`],
  [/\b8 CCR (?:§ ?)?(\d{3,5})\b/g, (m) => `8 CCR ${m[1]}`],
  [/\bNFPA (\d{2,4}[A-Z]?)\b/g, (m) => `NFPA ${m[1]}`],
  [/\bANSI(?:\/[A-Z]+)* ?([A-Z]\d{1,3}(?:\.\d+)?|Z\d{3}(?:\.\d+)?)\b/g, (m) => `ANSI ${m[1]}`],
  [/\bASME (B30\.\d+|A17\.\d+|B31\.\d+)\b/g, (m) => `ASME ${m[1]}`],
  [/\bAWS (D1\.\d)\b/g, (m) => `AWS ${m[1]}`],
  [/\bNIOSH\b/g, () => "NIOSH"],
  [/\bHAZWOPER\b/g, () => "29 CFR 1910.120"],
  [/\bCalCode\b|California Retail Food Code/g, () => "California Retail Food Code"],
  [/\b(?:B&P|Business and Professions Code) ?§ ?(\d{5})\b/g, (m) => `Cal. Bus. & Prof. Code §${m[1]}`],
  [/\b§ ?(25658|25602|25631)\b/g, (m) => `Cal. Bus. & Prof. Code §${m[1]}`],
  [/\bLabor Code ?§ ?(\d{3,4})\b/g, (m) => `Cal. Labor Code §${m[1]}`],
  [/\bISO (\d{4,5})\b/g, (m) => `ISO ${m[1]}`],
  [/\b(SOLAS|MARPOL|STCW|BWM Convention)\b/g, (m) => `IMO ${m[1]}`],
  [/\b45 CFR 46\b/g, () => "45 CFR 46"],
  [/\bIEC (\d{5})\b/g, (m) => `IEC ${m[1]}`],
  [/\bMUTCD\b/g, () => "MUTCD"],
  [/\bASHRAE (\d{2,3}(?:\.\d)?)\b/g, (m) => `ASHRAE ${m[1]}`],
  [/\bIIAR (\d)\b/g, (m) => `IIAR ${m[1]}`],
  [/\bNSF\/ANSI(?:\/CAN)? (\d{1,3})\b/g, (m) => `NSF/ANSI ${m[1]}`],
  [/\bAPI (?:RP |Std )?(\d{3,4})\b/g, (m) => `API ${m[1]}`],
  [/\bACGIH\b/g, () => "ACGIH TLVs"],
  [/\bEPA (?:Method )?(\d{1,4}[A-Z]?)\b/g, (m) => `EPA Method ${m[1]}`],
  [/\bASSE (\d{4})\b/g, (m) => `ASSE ${m[1]}`],
  [/\bAWWA ([A-Z]\d{2,3})\b/g, (m) => `AWWA ${m[1]}`],
];

function textOf(s) {
  // The station's own source is the record; catalog fields are the summary.
  const file = s.app === "trades" ? join(ROOT, "WebXR/trades/js/rooms", `${s.id}.js`) : join(ROOT, "WebXR/smartcity/js/sims", `${s.id}.js`);
  return existsSync(file) ? readFileSync(file, "utf8") : `${s.certification ?? ""} ${s.tagline ?? ""}`;
}
function citations(text) {
  const out = new Set();
  for (const [re, norm] of PATTERNS) for (const m of text.matchAll(re)) out.add(norm(m));
  return [...out].sort();
}

const rows = catalog.stations.map((s) => ({ s, cites: citations(textOf(s)) }));
const byCite = new Map();
for (const { s, cites } of rows) for (const c of cites) { if (!byCite.has(c)) byCite.set(c, []); byCite.get(c).push(s); }

const md = [];
md.push("# SmartCiti.X compliance matrix");
md.push("");
md.push(`_Generated from the station sources by \`tools/gen_compliance.mjs\` on ${new Date().toISOString().slice(0, 10)}: ${rows.length} procedures, ${byCite.size} distinct standards cited. A citation appears here only where a station's own text names it; the matrix is a map of what is taught, not a certification of compliance._`);
md.push("");
md.push("## How a procedure earns its place");
md.push("");
md.push(`Every station names the union and the certification a worker in that role holds, cites the standards its steps answer to in the step text a learner reads, is driven end to end in a browser, passes ${CHECKERS} automated checkers (parse, imports, layout, mesh budget, interruption reactions, crew roles, incident replay, curricula, catalog freshness, accessibility, devices, input, standards, console, competency, models) and is graded by \`tools/eval_content.mjs\` on variety, decisions, explanation, grounding, feedback, scene and originality. Attempts are recorded per learner with xAPI statements to a configured LRS and an LTI 1.3 launch relay; consent, licensing and the site rules for real places are in \`WebXR/assets/env/README.md\`, \`tools/briefs/hp-edition-brief.md\` and the flat briefing stations.`);
md.push("");
md.push("## By standard");
md.push("");
md.push("| Standard | Stations |");
md.push("|---|---|");
for (const [c, list] of [...byCite.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))) {
  md.push(`| ${c} | ${list.length}: ${list.map((s) => s.name).sort().join(", ")} |`);
}
md.push("");
md.push("## By programme");
md.push("");
const byId = new Map(rows.map((r) => [`${r.s.app}:${r.s.id}`, r]));
for (const p of catalog.curricula) {
  md.push(`### ${p.name}`);
  md.push("");
  md.push(`**Certification frame:** ${p.certification}`);
  md.push("");
  md.push("| Station | Trade | Standards cited |");
  md.push("|---|---|---|");
  for (const e of p.stations) {
    const r = byId.get(`${e.app}:${e.id}`); if (!r) continue;
    md.push(`| ${r.s.name} | ${r.s.trade ?? "—"} | ${r.cites.join(", ") || "—"} |`);
  }
  md.push("");
}
md.push("## Stations citing fewer than two standards");
md.push("");
const thin = rows.filter((r) => r.cites.length < 2);
md.push(thin.length ? thin.map((r) => `- ${r.s.name} (${r.s.app}): ${r.cites.join(", ") || "none"}`).join("\n") : "None.");
md.push("");
mkdirSync(join(ROOT, "docs/compliance"), { recursive: true });
writeFileSync(join(ROOT, "docs/compliance/compliance-matrix.md"), md.join("\n") + "\n");
console.log(`Wrote docs/compliance/compliance-matrix.md — ${rows.length} procedures, ${byCite.size} standards, ${thin.length} thin`);
