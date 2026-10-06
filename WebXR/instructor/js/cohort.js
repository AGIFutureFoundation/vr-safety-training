// The Cohorts view of the instructor console (console ENTERPRISE,
// docs/enterprise.md): the organisation layer shared/org.js keeps, rendered
// as plain text nodes. Nothing here sets markup from a string — a learner's
// display name, an organisation's name and a coordinator's note are all
// untrusted input by the time they reach this page (tools/check_console.mjs).
//
// What it shows: the organisation and its cohorts, an invite code per cohort
// and the join form a learner on this device uses, the programme ladder as a
// grid (one row per learner, one column per station: stars, unsafe actions,
// interruptions handled), a "needs attention" list, exports (CSV, xAPI, the
// cohort as JSON for another device) and the import that reads such a file,
// a printable certificate per learner, and this device's audit log.
//
// Every top-level name starts with `en` (the bundler shares one scope).

import {
  enLoad, enOrgs, enCreateOrg, enCohorts, enCreateCohort, enMembers, enJoin, enSetRole, enSetConsent, enRemoveMember,
  enRefreshLocal, enCohortProgress, enNeedsAttention, enCohortCSV, enCohortXAPI, enExportCohort, enImportCohort,
  enCertificateSVG, enAuditList, enLoadSample, enClear, EN_ROLES, EN_ATTENTION,
} from "../../shared/org.js";
import { PP_PROGRAMMES } from "../../shared/passport-programmes.js";
import { avSpriteSvg, avLookFromOutfit } from "../../shared/av-sprites.js";

const enEl = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const enState = { root: null, cohortId: null, enterprise: null, toast: null };

function enSay(text) { try { enState.toast?.(text); } catch (_) { /* no toast */ } }

function enDownload(name, text, type) {
  if (typeof URL?.createObjectURL !== "function") return false;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return true;
}

/** The programmes this deployment enables (docs/enterprise.md), else every one in the passport's catalogue. */
export function enEnabledProgrammes(enterprise = enState.enterprise) {
  const all = Object.keys(PP_PROGRAMMES);
  const list = enterprise?.programmes;
  const on = Array.isArray(list) ? all.filter((id) => list.includes(id)) : all;
  return on.length ? on : all;
}

function enButton(label, onClick, cls = "small") {
  const b = enEl("button", cls, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

function enField(label, input) {
  const wrap = enEl("label", "en-field");
  wrap.append(enEl("span", "muted", label), input);
  return wrap;
}

function enInput(type, placeholder, attrs = {}) {
  const i = enEl("input");
  i.type = type; i.placeholder = placeholder; i.autocomplete = "off";
  i.setAttribute("aria-label", placeholder);
  for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, String(v));
  return i;
}

function enSelect(options, value = null) {
  const s = enEl("select");
  for (const [v, label] of options) { const o = enEl("option", null, label); o.value = v; s.append(o); }
  if (value != null) s.value = value;
  return s;
}

// ------------------------------------------------------------ organisation

function enOrgPanel(root) {
  const panel = enEl("section", "panel");
  panel.id = "en-org";
  const orgs = enOrgs();
  panel.append(enEl("h2", null, "Organisation"));
  if (enState.enterprise?.organisation) panel.append(enEl("p", "fine", `This deployment is configured for ${enState.enterprise.organisation} (auth-config.json, enterprise block).`));
  if (!orgs.length) {
    panel.append(enEl("p", "fine", "No organisation on this device yet. Create one, or load the sample to see the view filled in."));
  } else {
    const ul = enEl("ul", "ints");
    for (const o of orgs) {
      const li = enEl("li", "int");
      const head = enEl("p", "int-kind", o.name);
      const dot = enEl("span", "en-dot"); dot.style.background = o.colour; dot.setAttribute("aria-hidden", "true");
      head.prepend(dot);
      li.append(head, enEl("p", null, `${enCohorts(o.id).length} cohort(s) · programmes: ${o.programmes.length ? o.programmes.map((p) => PP_PROGRAMMES[p]?.name ?? p).join(", ") : "any"}`));
      ul.append(li);
    }
    panel.append(ul);
  }
  const name = enInput("text", enState.enterprise?.organisation ? "Organisation name" : "Organisation name (e.g. a hall, a school, a company)", { maxlength: 80 });
  if (enState.enterprise?.organisation && !orgs.length) name.value = enState.enterprise.organisation;
  const colour = enInput("color", "Organisation colour"); colour.value = "#4fd1ff";
  const row = enEl("div", "row");
  row.append(name, colour, enButton("Create organisation", () => {
    const o = enCreateOrg({ name: name.value, colour: colour.value });
    if (!o) { enSay("Give the organisation a name."); return; }
    enSay(`Created ${o.name}.`); enRender(root);
  }, "primary small"));
  const tools = enEl("div", "row");
  tools.append(enButton("Load sample cohort", () => { const r = enLoadSample(); enState.cohortId = r.cohort?.id ?? null; enSay(r.fresh ? "Sample organisation and cohort loaded." : "The sample is already here."); enRender(root); }),
    enButton("Forget everything on this device", () => { if (typeof confirm === "function" && !confirm("Forget every organisation, cohort, member and audit line kept for this profile on this device?")) return; enClear(); enState.cohortId = null; enRender(root); }));
  panel.append(row, tools);
  return panel;
}

// ----------------------------------------------------------------- cohorts

function enCohortPanel(root) {
  const panel = enEl("section", "panel");
  panel.id = "en-cohorts";
  panel.append(enEl("h2", null, "Cohorts"));
  const orgs = enOrgs();
  const cohorts = enCohorts();
  if (cohorts.length) {
    const ul = enEl("ul", "ints");
    for (const c of cohorts) {
      const li = enEl("li", `int${c.id === enState.cohortId ? " en-sel" : ""}`);
      const members = enMembers(c.id);
      const learners = members.filter((m) => m.role === "learner").length;
      li.append(enEl("p", "int-kind", `${c.name} · ${PP_PROGRAMMES[c.programme]?.name ?? c.programme}${c.edition ? ` · ${c.edition}` : ""}`));
      li.append(enEl("p", null, `Starts ${c.startDate} · ${learners} of ${c.seats} seats · invite code `), enEl("code", "en-code", c.code));
      li.append(enButton(c.id === enState.cohortId ? "Shown below" : "Show this cohort", () => { enState.cohortId = c.id; enRender(root); }));
      ul.append(li);
    }
    panel.append(ul);
  } else panel.append(enEl("p", "fine", "No cohort yet."));
  if (orgs.length) {
    const org = enSelect(orgs.map((o) => [o.id, o.name]));
    const name = enInput("text", "Cohort name", { maxlength: 80 });
    const programme = enSelect(enEnabledProgrammes().map((id) => [id, PP_PROGRAMMES[id].name]));
    const edition = enInput("text", "Edition (e.g. 2026 spring)", { maxlength: 40 });
    const start = enInput("date", "Start date");
    const seats = enInput("number", "Seats", { min: 1, max: 1000 }); seats.value = "20";
    const row = enEl("div", "row");
    row.append(enField("Organisation", org), enField("Name", name), enField("Programme", programme), enField("Edition", edition), enField("Start", start), enField("Seats", seats));
    row.append(enButton("Create cohort", () => {
      const c = enCreateCohort({ orgId: org.value, name: name.value, programme: programme.value, edition: edition.value, startDate: start.value, seats: seats.value });
      if (!c) { enSay("A cohort needs a name and a programme."); return; }
      enState.cohortId = c.id; enSay(`Created ${c.name}; invite code ${c.code}.`); enRender(root);
    }, "primary small"));
    panel.append(enEl("h3", null, "New cohort"), row);
  }
  // Joining, for the learner on this device.
  const code = enInput("text", "Invite code", { maxlength: 9 });
  const who = enInput("text", "Your display name (initials are fine)", { maxlength: 40 });
  const role = enSelect(EN_ROLES.map((r) => [r, r]), "learner");
  const consent = enEl("input"); consent.type = "checkbox"; consent.id = "en-consent";
  const consentLabel = enEl("label", "muted"); consentLabel.setAttribute("for", "en-consent");
  consentLabel.append(consent, " Share my progress in this programme with the cohort's coordinator, on this device (off until you tick it)");
  const join = enEl("div", "row");
  join.append(code, who, role, enButton("Join", () => {
    const r = enJoin(code.value, { name: who.value, role: role.value, local: true, consent: consent.checked });
    if (!r.ok) { enSay(r.reason); return; }
    enState.cohortId = r.cohort.id; enSay(`${r.member.name} joined ${r.cohort.name} as ${r.member.role}.`); enRender(root);
  }, "primary small"));
  panel.append(enEl("h3", null, "Join a cohort on this device"), join, consentLabel);
  return panel;
}

// ---------------------------------------------------------- the cohort view

function enStars(n) { return "★".repeat(Math.max(0, Math.min(3, n | 0))) || "—"; }

function enMembersTable(root, view) {
  const wrap = enEl("div", "en-scroll");
  const table = enEl("table");
  table.id = "en-members";
  const thead = enEl("thead"); const hr = enEl("tr");
  for (const h of ["Member", "Role", "Joined", "Sharing", ""]) hr.append(enEl("th", null, h));
  thead.append(hr); table.append(thead);
  const tbody = enEl("tbody");
  for (const m of enMembers(view.cohort.id)) {
    const tr = enEl("tr");
    // A token sprite per member, seeded from the member id (no photo is ever
    // asked for); an instructor wears the role's gear, a learner plain clothes.
    const tdName = enEl("td");
    const face = enEl("span", "en-face"); face.setAttribute("aria-hidden", "true");
    let seed = 0; for (const ch of String(m.id)) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) >>> 0;
    try { face.innerHTML = avSpriteSvg(avLookFromOutfit(/instructor/i.test(m.role) ? "construction" : "office", seed), { kind: "token", size: 24 }); } catch (_) { /* stub DOM */ }
    tdName.append(face, " ", `${m.name}${m.local ? " (this device)" : ""}`);
    tr.append(tdName);
    const role = enSelect(EN_ROLES.map((r) => [r, r]), m.role);
    role.setAttribute("aria-label", `Role of ${m.name}`);
    role.addEventListener("change", () => { if (enSetRole(m.id, role.value)) { enSay(`${m.name} is now ${role.value}.`); enRender(root); } });
    const tdRole = enEl("td"); tdRole.append(role); tr.append(tdRole);
    tr.append(enEl("td", null, String(m.joinedAt ?? "").slice(0, 10)));
    const tdShare = enEl("td");
    if (m.local) {
      const share = enButton(m.consent?.progress ? "Sharing — stop" : "Not sharing — start", () => { enSetConsent(m.id, !m.consent?.progress); enRender(root); });
      tdShare.append(share);
    } else tdShare.textContent = m.consent?.progress ? "shared" : "not shared";
    tr.append(tdShare);
    const tdX = enEl("td"); tdX.append(enButton("Remove", () => { if (typeof confirm === "function" && !confirm(`Remove ${m.name} from ${view.cohort.name}?`)) return; enRemoveMember(m.id); enRender(root); }));
    tr.append(tdX);
    tbody.append(tr);
  }
  table.append(tbody); wrap.append(table);
  return wrap;
}

function enGrid(view) {
  const wrap = enEl("div", "en-scroll");
  const table = enEl("table", "en-grid");
  table.id = "en-grid";
  const thead = enEl("thead"); const hr = enEl("tr");
  hr.append(enEl("th", null, "Learner"));
  for (const st of view.programme.stations) { const th = enEl("th", "en-station", st); th.title = st; hr.append(th); }
  hr.append(enEl("th", null, "Passed"), enEl("th", null, "Stars"));
  thead.append(hr); table.append(thead);
  const tbody = enEl("tbody");
  for (const row of view.rows) {
    const tr = enEl("tr");
    tr.append(enEl("td", null, row.name));
    if (!row.shared) {
      const td = enEl("td", "muted", "not sharing progress"); td.colSpan = view.programme.stations.length; tr.append(td);
    } else {
      for (const c of row.cells) {
        const td = enEl("td", c ? (c.passed ? "en-pass" : c.attempts >= EN_ATTENTION.stuckAttempts ? "en-stuck" : "en-try") : "en-none");
        if (c) {
          td.append(enEl("div", "en-stars", enStars(c.stars)));
          td.append(enEl("div", "en-cell", `${c.unsafe} unsafe · ${c.handled}/${c.handled + c.missed} interrupts · ${c.attempts} try`));
          td.title = `${c.attempts} attempt(s), best ${c.stars} stars, ${c.unsafe} unsafe action(s), ${c.handled} interruption(s) handled, ${c.missed} missed`;
        } else td.textContent = "·";
        tr.append(td);
      }
    }
    tr.append(enEl("td", null, `${row.passed}/${row.total}`), enEl("td", null, String(row.stars)));
    tbody.append(tr);
  }
  if (!view.rows.length) { const tr = enEl("tr"); const td = enEl("td", "muted", "No learner has joined this cohort yet."); td.colSpan = view.programme.stations.length + 3; tr.append(td); tbody.append(tr); }
  table.append(tbody); wrap.append(table);
  return wrap;
}

function enAttention(view) {
  const ul = enEl("ul", "ints");
  ul.id = "en-attention";
  const items = enNeedsAttention(view.cohort.id);
  if (!items.length) ul.append(enEl("li", "muted", "Nobody needs attention by the platform defaults."));
  for (const it of items) {
    const li = enEl("li", `int en-${it.kind}`);
    li.append(enEl("p", "int-kind", `${it.name} · ${it.kind.replace("-", " ")}`), enEl("p", null, it.note));
    ul.append(li);
  }
  return ul;
}

/** Open a learner's certificate in a new tab (for printing) and download the SVG. */
export function enOpenCertificate(view, row) {
  const org = enOrgs().find((o) => o.id === view.cohort.orgId);
  const svg = enCertificateSVG({ org, cohort: view.cohort, programme: view.programme, learner: row.name, passed: row.passed, total: row.total, stars: row.stars });
  if (!svg) { enSay(`${row.name} has passed ${row.passed} of ${row.total} stations — a certificate is for a completed programme.`); return null; }
  const name = `certificate-${row.name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}-${view.programme.id}.svg`;
  enDownload(name, svg, "image/svg+xml");
  enSay(`Certificate for ${row.name} written as ${name} — open it and print.`);
  return svg;
}

function enViewPanel(root) {
  const panel = enEl("section", "panel");
  panel.id = "en-view";
  const view = enState.cohortId ? enCohortProgress(enState.cohortId) : null;
  if (!view) { panel.append(enEl("h2", null, "Cohort view"), enEl("p", "fine", "Pick a cohort above to see its ladder.")); return panel; }
  panel.append(enEl("h2", null, `${view.cohort.name} — ${view.programme.name}`));
  panel.append(enEl("p", "fine", `${view.rows.length} learner(s) · ${view.programme.stations.length} stations · invite code ${view.cohort.code}. Progress here comes from each learner's own snapshot, shared with their consent; a learner who has not shared shows as "not sharing".`));
  const tools = enEl("div", "row");
  tools.append(
    enButton("Export CSV", () => { enDownload(`cohort-${view.cohort.name.replace(/\W+/g, "-").toLowerCase()}.csv`, enCohortCSV(view.cohort.id), "text/csv"); enSay("CSV written."); enRender(root); }),
    enButton("Export xAPI", () => { enDownload(`cohort-${view.cohort.name.replace(/\W+/g, "-").toLowerCase()}-xapi.json`, JSON.stringify(enCohortXAPI(view.cohort.id), null, 2), "application/json"); enSay("xAPI statements written."); enRender(root); }),
    enButton("Export cohort (JSON, for another device)", () => { const doc = enExportCohort(view.cohort.id); if (doc) enDownload(`cohort-${view.cohort.name.replace(/\W+/g, "-").toLowerCase()}.json`, JSON.stringify(doc, null, 2), "application/json"); enSay("Cohort file written."); enRender(root); }),
  );
  const file = enInput("file", "Import a cohort file"); file.accept = "application/json,.json"; file.id = "en-import";
  file.addEventListener("change", () => {
    const f = file.files?.[0];
    if (!f || typeof f.text !== "function") return;
    f.text().then((t) => { let doc = null; try { doc = JSON.parse(t); } catch (_) { doc = null; }
      const r = enImportCohort(doc);
      enSay(r.ok ? `Imported: +${r.added.cohorts} cohort, +${r.added.members} members.` : `Not a cohort file: ${r.errors[0]}`);
      enRender(root);
    });
  });
  tools.append(enField("Import cohort JSON", file));
  panel.append(tools);
  panel.append(enEl("h3", null, "Members"), enMembersTable(root, view));
  panel.append(enEl("h3", null, "Programme ladder"), enGrid(view));
  panel.append(enEl("h3", null, `Needs attention (platform defaults: ${EN_ATTENTION.stuckAttempts}+ attempts without a pass, or ${EN_ATTENTION.inactiveDays}+ days inactive)`), enAttention(view));
  const certs = enEl("div", "row"); certs.id = "en-certs";
  for (const row of view.rows) {
    const b = enButton(`Certificate: ${row.name}${row.passed < row.total ? ` (${row.passed}/${row.total})` : ""}`, () => enOpenCertificate(view, row));
    if (row.passed < row.total) b.disabled = true;
    certs.append(b);
  }
  panel.append(enEl("h3", null, "Completion certificates (prototype — not a credential)"), certs);
  return panel;
}

function enAuditPanel() {
  const panel = enEl("section", "panel");
  panel.id = "en-audit";
  panel.append(enEl("h2", null, "Audit log — coordinator actions on this device"));
  panel.append(enEl("p", "fine", "Exports, imports, role changes and cohort creation, newest first. Kept with this profile on this device only; never sent anywhere."));
  const list = enAuditList();
  const table = enEl("table"); const tbody = enEl("tbody");
  const thead = enEl("thead"); const hr = enEl("tr"); for (const h of ["Time", "Action", "Detail"]) hr.append(enEl("th", null, h)); thead.append(hr); table.append(thead);
  for (const a of list.slice(0, 100)) { const tr = enEl("tr"); tr.append(enEl("td", null, String(a.at).replace("T", " ").slice(0, 19)), enEl("td", null, a.action), enEl("td", null, a.detail)); tbody.append(tr); }
  if (!list.length) { const tr = enEl("tr"); const td = enEl("td", "muted", "Nothing yet."); td.colSpan = 3; tr.append(td); tbody.append(tr); }
  table.append(tbody); panel.append(table);
  return panel;
}

/** Rebuild the whole view from the store (plain text nodes only). */
export function enRender(root = enState.root) {
  if (!root) return null;
  enRefreshLocal();
  root.replaceChildren();
  root.append(enOrgPanel(root), enCohortPanel(root), enViewPanel(root), enAuditPanel());
  return root;
}

const EN_CSS = `
#view-cohort .en-field{display:inline-flex;flex-direction:column;gap:3px;font-size:12px}
#view-cohort .en-field input,#view-cohort .en-field select{min-width:120px}
#view-cohort input[type=color]{width:44px;min-height:40px;padding:2px;flex:0 0 auto}
#view-cohort .en-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}
#view-cohort code.en-code{font:600 14px ui-monospace,Menlo,Consolas,monospace;color:var(--accent);letter-spacing:.08em}
#view-cohort .int.en-sel{border-color:var(--accent)}
#view-cohort .en-scroll{overflow:auto;max-width:100%}
#view-cohort table.en-grid th.en-station{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
#view-cohort table.en-grid td{min-width:96px;font-size:11.5px;line-height:1.35}
#view-cohort .en-stars{color:var(--warn);font-size:13px}
#view-cohort td.en-pass{background:rgba(89,201,123,.14)}
#view-cohort td.en-stuck{background:rgba(240,100,91,.18)}
#view-cohort td.en-try{background:rgba(242,193,75,.12)}
#view-cohort td.en-none{color:var(--muted);text-align:center}
#view-cohort .int.en-stuck{border-left:3px solid var(--bad)}
#view-cohort .int.en-inactive{border-left:3px solid var(--warn)}
#view-cohort .int.en-not-sharing{border-left:3px solid var(--edge)}
`;

/**
 * Mount the view into `root` (the console's #view-cohort). `enterprise` is the
 * deployment's block (Auth.config.enterprise) once auth-config.json has been
 * read; `toast` is the console's own status line.
 */
export function enMountCohortView(root, { enterprise = null, toast = null } = {}) {
  if (!root) return null;
  enState.root = root; enState.enterprise = enterprise; enState.toast = toast;
  if (!document.getElementById("en-style")) { const s = document.createElement("style"); s.id = "en-style"; s.textContent = EN_CSS; document.head.appendChild(s); }
  if (!enState.cohortId) enState.cohortId = enLoad().cohorts[0]?.id ?? null;
  try { addEventListener("gt:profile", () => enRender(root)); } catch (_) { /* headless */ }
  return enRender(root);
}

/** Let the console hand over the enterprise block after the config loads. */
export function enSetEnterprise(enterprise) { enState.enterprise = enterprise ?? null; if (enState.root) enRender(enState.root); }
