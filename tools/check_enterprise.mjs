#!/usr/bin/env node
/**
 * The organisation layer (WebXR/shared/org.js, the instructor console's
 * Cohorts view, the enterprise block of auth-config.json, the privacy page —
 * docs/enterprise.md). Headless: Map-backed storage and a small DOM stub.
 *
 *     node tools/check_enterprise.mjs
 *
 *   1. the schema: an empty store, the sample, every member field, the key
 *      is a private profile key;
 *   2. the invite flow: codes normalise, a wrong code and a full cohort are
 *      refused, consent is off by default, sharing on and off;
 *   3. the cohort export/import round trip is exact and carries no snapshot
 *      of a member who did not share;
 *   4. the console's cohort view renders the sample: the grid, the tinted
 *      cells, the not-sharing row, needs attention, audit rows, certificates;
 *   5. the certificate: well-formed SVG, both names, "prototype — not a
 *      credential" twice, no image or script, escaped text, null when partial;
 *   6. the config block is honoured: the cleaner, the dialog's methods, the
 *      homepage script, the console's programme filter;
 *   7. no network call, no identity-vendor name, the privacy page linked.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failures += 1; console.log(`  ✗ ${name}\n      ${e.stack ?? e}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

// ------------------------------------------------------------ a small DOM
class EnNode {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.parent = null; this.listeners = {}; this.style = {}; this._text = ""; this.value = ""; this.dataset = {}; }
  get id() { return this.attrs.id ?? ""; }
  set id(v) { this.attrs.id = v; }
  get hidden() { return "hidden" in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ""; else delete this.attrs.hidden; }
  get className() { return this.attrs.class ?? ""; }
  set className(v) { this.attrs.class = v; }
  get disabled() { return "disabled" in this.attrs; }
  set disabled(v) { if (v) this.attrs.disabled = ""; else delete this.attrs.disabled; }
  set title(v) { this.attrs.title = String(v); }
  get title() { return this.attrs.title ?? ""; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  set textContent(v) { this.children = []; this._text = String(v ?? ""); }
  append(...kids) { for (const k of kids) this.appendChild(typeof k === "string" ? Object.assign(new EnNode("#text"), { _text: k }) : k); }
  appendChild(k) { k.parent?.children.splice(k.parent.children.indexOf(k), 1); k.parent = this; this.children.push(k); return k; }
  prepend(k) { this.appendChild(k); this.children.unshift(this.children.pop()); }
  replaceChildren(...kids) { this.children = []; this._text = ""; this.append(...kids); }
  remove() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  click() { if (!this.disabled) for (const f of this.listeners.click ?? []) f({ target: this }); }
  *walk() { for (const c of this.children) { yield c; yield* c.walk(); } }
  matches(sel) {
    return sel.split(",").some((part) => {
      const chain = part.trim().split(/\s+/);
      const one = (n, s) => {
        const not = /:not\(\[(\w+)\]\)/.exec(s); s = s.replace(/:not\(\[\w+\]\)/, "");
        if (not && not[1] in n.attrs) return false;
        const m = /^([a-z]*)(?:#([\w-]+))?(?:\.([\w-]+))?$/.exec(s);
        if (!m) return false;
        if (m[1] && n.tagName !== m[1].toUpperCase()) return false;
        if (m[2] && n.id !== m[2]) return false;
        if (m[3] && !n.className.split(/\s+/).includes(m[3])) return false;
        return true;
      };
      if (!one(this, chain[chain.length - 1])) return false;
      if (chain.length === 1) return true;
      for (let p = this.parent; p; p = p.parent) if (one(p, chain[0])) return true;
      return false;
    });
  }
  querySelector(sel) { for (const n of this.walk()) if (n.tagName !== "#TEXT" && n.matches(sel)) return n; return null; }
  querySelectorAll(sel) { return [...this.walk()].filter((n) => n.tagName !== "#TEXT" && n.matches(sel)); }
}
const html = new EnNode("html"); const head = new EnNode("head"); const body = new EnNode("body"); html.append(head, body);
globalThis.document = { head, body, documentElement: html, createElement: (t) => new EnNode(t), getElementById: (id) => html.querySelector(`#${id}`), querySelector: (s) => html.querySelector(s), querySelectorAll: (s) => html.querySelectorAll(s), addEventListener() {} };
const localStore = new Map(), sessionStore = new Map();
const mkStore = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) });
globalThis.localStorage = mkStore(localStore);
globalThis.sessionStorage = mkStore(sessionStore);
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.confirm = () => true;
const net = [];
globalThis.fetch = async (u) => { net.push(String(u)); return { ok: false }; };

const org = await import("../WebXR/shared/org.js");
const { PP_PROGRAMMES } = await import("../WebXR/shared/passport-programmes.js");
const { GT_PROFILE_KEYS } = await import("../WebXR/shared/profiles.js");
const auth = await import("../WebXR/shared/auth.js");
const cohortView = await import("../WebXR/instructor/js/cohort.js");

console.log("Organisation layer — self-test\n");

// ---------------------------------------------------------------- 1. schema
await check("the schema: an empty store, the sample, every member field, a private profile key", () => {
  const e = org.enEmpty();
  eq(JSON.stringify(Object.keys(e)), JSON.stringify(["v", "orgs", "cohorts", "members", "audit"]), "empty store shape");
  eq(org.enLoad().v, org.EN_SCHEMA_VERSION, "a missing store reads as empty");
  assert(GT_PROFILE_KEYS.includes(org.EN_KEY), `${org.EN_KEY} is not a per-profile key in profiles.js`);
  const s = org.enLoadSample();
  assert(s.fresh && s.org && s.cohort, "the sample did not load");
  assert(org.enLoadSample().fresh === false, "the sample is not idempotent");
  const st = org.enLoad();
  eq(st.orgs.length, 1, "orgs"); eq(st.cohorts.length, 1, "cohorts"); eq(st.members.length, 4, "members");
  assert(/^#[0-9a-f]{6}$/.test(st.orgs[0].colour), "colour");
  assert(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(st.cohorts[0].code), `invite code ${st.cohorts[0].code}`);
  assert(PP_PROGRAMMES[st.cohorts[0].programme], "the cohort's programme is in the passport catalogue");
  for (const m of st.members) {
    for (const k of ["id", "cohortId", "name", "role", "joinedAt", "local", "consent", "progress"]) assert(k in m, `member lacks ${k}`);
    assert(org.EN_ROLES.includes(m.role), "role");
    assert(/^m-[0-9a-f]{12}$/.test(m.id), "a member id is a random local handle");
    if (m.progress) for (const x of m.progress.stations) eq(JSON.stringify(Object.keys(x)), JSON.stringify(["simId", "attempts", "stars", "unsafe", "handled", "missed", "passed", "lastAt"]), "snapshot station fields");
  }
  const doc = read("docs/enterprise.md");
  for (const k of ["vr-org-v1", "invite code", "consent", "enSnapshot", "enNeedsAttention", "enCertificateSVG", "signInMethods", "defaultLanguage", "dataRetention"]) assert(doc.includes(k), `docs/enterprise.md does not document ${k}`);
});

// ----------------------------------------------------------- 2. invite flow
await check("the invite flow: normalised codes, a wrong code and a full cohort refused, consent off by default", () => {
  eq(org.enNormaliseCode(" abcd-efgh "), "ABCD-EFGH", "normalise");
  eq(org.enNormaliseCode("abc"), null, "a short code");
  const o = org.enCreateOrg({ name: "Hall <b>Two</b>", colour: "not-a-colour", programmes: ["fall-protection", "no-such-programme"] });
  eq(o.name, "Hall bTwo/b", "org name is cleaned of markup");
  eq(o.colour, "#4fd1ff", "a bad colour falls back");
  eq(JSON.stringify(o.programmes), JSON.stringify(["fall-protection"]), "unknown programmes dropped");
  const c = org.enCreateCohort({ orgId: o.id, name: "Spring", programme: "fall-protection", seats: 1, startDate: "2026-04-01" });
  assert(c && c.seats === 1 && c.startDate === "2026-04-01", "cohort");
  eq(org.enCreateCohort({ orgId: o.id, name: "x", programme: "nope" }), null, "an unknown programme is refused");
  const bad = org.enJoin("ZZZZ-ZZZZ", { name: "X" });
  assert(!bad.ok && /no cohort/i.test(bad.reason), "a wrong code is refused");
  const j1 = org.enJoin(c.code.toLowerCase(), { name: "J. One", local: true });
  assert(j1.ok, `join: ${j1.reason}`);
  eq(j1.member.consent.progress, false, "consent is off by default");
  eq(j1.member.progress, null, "no snapshot without consent");
  eq(org.enAuditList()[0].action, "member-join", "a join is audited on the device where it happens");
  // The learner's own view (the dialog, the homepage): their ladder from this device's records, consent or not.
  const mine = org.enMyCohorts([{ id: "r0", at: "2026-04-01T10:00:00.000Z", simId: PP_PROGRAMMES["fall-protection"].stations[0], stars: 2, hazardHits: 0, passed: true }]);
  eq(mine.length, 1, "one local cohort");
  eq(mine[0].cohort.name, "Spring", "the cohort"); eq(mine[0].member.sharing, false, "not sharing");
  eq(mine[0].passed, 1, "one station passed on this device"); eq(mine[0].total, PP_PROGRAMMES["fall-protection"].stations.length, "the ladder's length");
  eq(mine[0].ladder[0].state, "passed", "the first rung"); eq(mine[0].ladder[1].state, "todo", "the second rung");
  eq(org.enMembers(c.id).find((x) => x.id === j1.member.id).progress, null, "the learner's own view stores no snapshot");
  const j2 = org.enJoin(c.code, { name: "J. Two" });
  assert(!j2.ok && /seat/.test(j2.reason), "a full cohort is refused");
  const j3 = org.enJoin(c.code, { name: "Coach", role: "instructor" });
  assert(j3.ok, "instructors do not take a seat");
  eq(org.enJoin(c.code, { name: "" }).ok, false, "a name is needed");
  // Sharing on: the local member's snapshot comes from this device's records.
  localStorage.setItem("vr-training-records-v1", JSON.stringify([
    { id: "r1", at: "2026-04-02T10:00:00.000Z", simId: "tower-climb", stars: 3, hazardHits: 0, passed: true, interrupts: { answered: 1, wrong: 0, missed: 0 }, learner: "secret tag", debrief: { steps: [] } },
    { id: "r2", at: "2026-04-03T10:00:00.000Z", simId: "tower-climb", stars: 1, hazardHits: 2, passed: false, interrupts: null },
    { id: "r3", at: "2026-04-03T11:00:00.000Z", simId: "not-in-programme", stars: 3, hazardHits: 0, passed: true },
  ]));
  eq(org.enRefreshLocal(), 0, "nothing refreshes without consent");
  org.enSetConsent(j1.member.id, true);
  eq(org.enRefreshLocal(), 1, "the consenting local member refreshes");
  const m = org.enMembers(c.id).find((x) => x.id === j1.member.id);
  eq(m.progress.stations.length, 1, "only the programme's stations are in the snapshot");
  const st = m.progress.stations[0];
  eq(st.attempts, 2, "attempts"); eq(st.stars, 3, "best stars"); eq(st.unsafe, 0, "unsafe on the best run"); eq(st.handled, 1, "handled"); eq(st.passed, true, "passed");
  assert(!JSON.stringify(m).includes("secret tag") && !JSON.stringify(m).includes("debrief"), "the snapshot carries a crew tag or a debrief");
  org.enSetConsent(j1.member.id, false);
  eq(org.enMembers(c.id).find((x) => x.id === j1.member.id).progress, null, "sharing off drops the snapshot");
  assert(org.enSetRole(j1.member.id, "coordinator"), "role change");
  assert(org.enAuditList()[0].action === "role-change", "a role change is audited");
  assert(!org.enSetRole(j1.member.id, "owner"), "an unknown role is refused");
});

// ------------------------------------------------------------ 3. round trip
await check("the cohort export/import round trip is exact and carries no unshared snapshot", () => {
  const sample = org.enCohorts().find((c) => c.name === "Sample cohort");
  const before = org.enCohortProgress(sample.id);
  const doc = org.enExportCohort(sample.id);
  eq(doc.v, 1, "v"); eq(doc.kind, "cohort", "kind");
  eq(doc.members.length, 4, "members exported");
  const unshared = doc.members.find((m) => !m.consent.progress);
  assert(unshared && unshared.progress === null, "an unshared member's snapshot left the device");
  eq(doc.members.filter((m) => m.progress).length, 3, "shared snapshots");
  assert(!("audit" in doc), "the audit log is never exported");
  eq(org.enValidateCohortDoc(doc).length, 0, "the export validates");
  assert(org.enValidateCohortDoc({ v: 1, kind: "cohort" }).length > 0, "a bare document is refused");
  assert(!org.enImportCohort({ v: 2 }).ok, "a wrong version is refused");
  const copy = JSON.parse(JSON.stringify(doc));
  localStore.clear();
  const r = org.enImportCohort(copy);
  assert(r.ok, r.errors.join("; "));
  eq(JSON.stringify(r.added), JSON.stringify({ orgs: 1, cohorts: 1, members: 4 }), "added");
  const after = org.enCohortProgress(sample.id);
  eq(JSON.stringify(after.rows), JSON.stringify(before.rows), "rows differ after the round trip");
  eq(after.cohort.code, before.cohort.code, "the invite code survives");
  const again = org.enImportCohort(copy);
  eq(JSON.stringify(again.added), JSON.stringify({ orgs: 0, cohorts: 0, members: 0 }), "a second import adds nothing");
  eq(org.enAuditList()[0].action, "cohort-import", "an import is audited");
  const csv = org.enCohortCSV(sample.id).split("\r\n").filter(Boolean);
  eq(csv[0], org.EN_CSV_COLUMNS.join(","), "csv header");
  eq(csv.length - 1, 13, "csv rows: one per shared learner per attempted station");
  const x = org.enCohortXAPI(sample.id);
  eq(x.statements.length, 13, "xapi statements");
  for (const s of x.statements) { assert(/verbs\/(passed|failed)$/.test(s.verb.id), "verb"); assert(/^m-/.test(s.actor.account.name), "the actor account is the local handle"); }
  const attn = org.enNeedsAttention(sample.id);
  eq(attn.map((a) => a.kind).sort().join(","), "inactive,not-sharing,stuck", "needs attention kinds");
});

// ------------------------------------------------------------- 4. the view
await check("the console's cohort view renders the sample: grid, tints, not-sharing row, attention, audit, certificates", () => {
  const root = new EnNode("div"); root.id = "en-root"; body.append(root);
  let toasts = [];
  cohortView.enMountCohortView(root, { toast: (t) => toasts.push(t) });
  assert(root.querySelector("#en-org") && root.querySelector("#en-cohorts") && root.querySelector("#en-view") && root.querySelector("#en-audit"), "the four panels");
  const grid = root.querySelector("#en-grid");
  assert(grid, "no grid");
  const stations = PP_PROGRAMMES["fall-protection"].stations.length;
  eq(grid.querySelectorAll("thead th").length, stations + 3, "grid columns");
  eq(grid.querySelectorAll("tbody tr").length, 4, "grid rows");
  assert(grid.querySelectorAll("td.en-pass").length >= stations, "passed cells tinted");
  eq(grid.querySelectorAll("td.en-stuck").length, 1, "one stuck cell");
  assert(grid.textContent.includes("not sharing progress"), "the not-sharing row");
  assert(grid.textContent.includes("★★★") && /unsafe/.test(grid.textContent) && /interrupts/.test(grid.textContent), "cells show stars, unsafe actions and interruptions");
  eq(root.querySelectorAll("#en-attention li").length, 3, "attention items");
  assert(root.querySelectorAll("#en-audit tbody tr").length >= 1, "audit rows");
  const certs = root.querySelectorAll("#en-certs button");
  eq(certs.length, 4, "a certificate button per learner");
  eq(certs.filter((b) => !b.disabled).length, 1, "only the complete learner's certificate is enabled");
  assert(root.textContent.includes("prototype — not a credential"), "the certificates heading says prototype");
  assert(root.textContent.includes("platform defaults"), "the thresholds are named as platform defaults");
  // No markup from strings anywhere on the console.
  for (const f of ["WebXR/instructor/js/cohort.js", "WebXR/shared/org.js"]) {
    const src = read(f);
    for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) assert(!src.includes(sink), `${f} uses ${sink}`);
  }
  assert(read("WebXR/instructor/index.html").includes('id="tab-cohort"') && read("WebXR/instructor/js/app.js").includes("enMountCohortView("), "the console does not mount the view");
  assert(/instructor\/js\/cohort\.js/.test(read("tools/bundle_webxr.py")) && /SHARED \/ "org\.js"/.test(read("tools/bundle_webxr.py")), "the bundler does not carry org.js and cohort.js");
  // Role change through the view is audited.
  const sel = root.querySelectorAll("#en-members select").pop(); // the last member (not sharing) so the complete learner stays a learner
  sel.value = "instructor"; for (const f of sel.listeners.change ?? []) f({});
  eq(org.enAuditList()[0].action, "role-change", "a role change from the view is audited");
});

// ------------------------------------------------------------ 5. certificate
await check("the certificate: well-formed SVG, both names, the prototype line twice, no image, escaped text, null when partial", () => {
  const sample = org.enCohorts().find((c) => c.name === "Sample cohort");
  const v = org.enCohortProgress(sample.id);
  const done = v.rows.find((r) => r.passed === r.total);
  const o = org.enOrg(sample.orgId);
  const svg = org.enCertificateSVG({ org: { ...o, name: "Hall & <Sons>" }, cohort: sample, programme: v.programme, learner: "A. <Learner>", passed: done.passed, total: done.total, stars: done.stars, date: "2026-09-28" });
  assert(svg && svg.startsWith("<svg xmlns=\"http://www.w3.org/2000/svg\"") && svg.trim().endsWith("</svg>"), "svg envelope");
  eq((svg.match(/PROTOTYPE — NOT A CREDENTIAL/g) ?? []).length, 2, "the prototype line, twice");
  assert(svg.includes("HALL &amp; &lt;SONS&gt;") && svg.includes("A. &lt;Learner&gt;"), "names are escaped");
  assert(svg.includes(v.programme.name), "the programme's name");
  for (const bad of ["<image", "<script", "href=", "<foreignObject"]) assert(!svg.includes(bad), `certificate carries ${bad}`);
  eq((svg.match(/<(\w+)[\s>]/g) ?? []).length, (svg.match(/<\/(\w+)>/g) ?? []).length + (svg.match(/\/>/g) ?? []).length, "tags balance");
  const partial = v.rows.find((r) => r.passed < r.total);
  eq(org.enCertificateSVG({ org: o, cohort: sample, programme: v.programme, learner: partial.name, passed: partial.passed, total: partial.total, stars: partial.stars }), null, "a partial programme gets no certificate");
  for (const f of ["docs/img/enterprise/cohort-view.png", "docs/img/enterprise/certificate-sample.png"]) assert(existsSync(join(ROOT, f)), `${f} missing`);
});

// ----------------------------------------------------------- 6. the config
await check("the enterprise block is honoured: the cleaner, the dialog, the homepage script, the console", () => {
  const file = JSON.parse(read("WebXR/auth-config.json"));
  assert(file.enterprise && "organisation" in file.enterprise && "signInMethods" in file.enterprise && "defaultLanguage" in file.enterprise && "worlds" in file.enterprise && "programmes" in file.enterprise && "dataRetention" in file.enterprise && "sso" in file.enterprise, "the block's keys");
  eq(file.enterprise.organisation, null, "the public build names no organisation");
  const e = auth.cleanEnterprise({ organisation: " Hall <x> ", signInMethods: ["google", "demo", "bogus", 7], defaultLanguage: "ES", worlds: ["bayworld", "mars"], programmes: ["fall-protection", "x y"], dataRetention: "30 days", sso: { note: "ours" } });
  eq(e.organisation, "Hall <x>", "organisation is text (rendered as a text node)");
  eq(JSON.stringify(e.signInMethods), JSON.stringify(["google", "demo"]), "methods filtered");
  eq(e.defaultLanguage, "es", "language lower-cased");
  eq(JSON.stringify(e.worlds), JSON.stringify(["bayworld"]), "worlds filtered");
  eq(JSON.stringify(e.programmes), JSON.stringify(["fall-protection"]), "programmes cleaned");
  eq(e.sso, "ours", "sso note");
  const cfg = auth.parseAuthConfig({ enterprise: { signInMethods: ["wallet"] } }, "?enterprise=x");
  assert(auth.enterpriseAllows(cfg, "wallet") && !auth.enterpriseAllows(cfg, "google") && !auth.enterpriseAllows(cfg, "demo"), "enterpriseAllows");
  assert(auth.enterpriseAllows(auth.EMPTY_AUTH_CONFIG, "demo"), "the empty config allows everything");
  const acct = read("WebXR/shared/account.js");
  assert(acct.includes("enterpriseAllows(cfg, m)") && acct.includes('allow("demo")') && acct.includes('allow("wallet")') && acct.includes('allow("google")'), "the dialog does not honour signInMethods");
  assert(acct.includes("gt-org") && acct.includes("gtPrivacyHref"), "the dialog does not show the organisation or link the privacy page");
  // The learner's side: the dialog's join form (consent off until ticked) and the homepage's "My cohorts" card.
  assert(acct.includes('id: "gt-join"') && acct.includes('id: "gt-join-consent", type: "checkbox"') && acct.includes("enJoin(code.value, { name: name.value, role: \"learner\", local: true, consent: consent.checked })"), "the dialog's join form");
  assert(!/gt-join-consent[^\n]*checked: true/.test(acct), "the consent box is ticked by default");
  assert(/for _en_cfg in APPS\.values\(\)/.test(read("tools/bundle_webxr.py")) && read("tools/bundle_webxr.py").includes('"org.js",'), "the bundler does not carry org.js with account.js and into dist/shared");
  const home = read("tools/gen_home.mjs");
  assert(home.includes("function hmApplyEnterprise(") && home.includes("hmApplyEnterprise(mod.Auth.config?.enterprise)"), "the homepage script does not apply the block");
  for (const k of ["e.organisation", "e.worlds", "e.programmes", "e.defaultLanguage"]) assert(home.includes(k), `the homepage ignores ${k}`);
  assert(home.includes("function hmCohorts(") && home.includes('import("./shared/org.js").then(hmCohorts)') && home.includes('id="hm-cont-cohorts"'), "the homepage's continue strip does not show the learner's cohorts");
  assert(read("WebXR/index.html").includes("hmApplyEnterprise") && read("WebXR/home.html").includes("hmApplyEnterprise"), "the generated homepages are stale — run node tools/gen_home.mjs");
  eq(cohortView.enEnabledProgrammes({ programmes: ["fall-protection", "nope"] }).join(","), "fall-protection", "the console's programme filter");
  eq(cohortView.enEnabledProgrammes(null).length, Object.keys(PP_PROGRAMMES).length, "no block: every programme");
  assert(read("WebXR/instructor/js/app.js").includes("enEnabledProgrammes(Auth.config?.enterprise)"), "the console's programme picker ignores the block");
  // The block is read from the file only, never from the launch URL.
  const viaUrl = auth.parseAuthConfig(null, "?organisation=Evil&enterprise=%7B%22organisation%22%3A%22Evil%22%7D");
  eq(viaUrl.enterprise.organisation, null, "the launch URL named an organisation");
});

// ------------------------------------------------------ 7. privacy, network
await check("no network call, no identity-vendor name, the privacy page exists and is linked", () => {
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
  for (const f of ["WebXR/shared/org.js", "WebXR/instructor/js/cohort.js"]) {
    const code = read(f).replace(/^\s*\/\/.*$/gm, "");
    for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "import(", "<img", ".src ="]) assert(!code.includes(api), `${f} reaches for ${api}`);
  }
  const privacy = read("WebXR/privacy.html");
  for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "<img", "<iframe", "http://"]) assert(!privacy.includes(api), `privacy.html carries ${api}`);
  for (const k of ["vr-org-v1", "vr-training-records-v1", "sessionStorage", "consent", "audit", "opt-in"]) assert(privacy.includes(k), `privacy.html does not mention ${k}`);
  assert(privacy.includes("ctlMount("), "privacy.html does not mount the controls (and so the account chip)");
  assert(read("tools/gen_home.mjs").includes('"privacy.html"') && read("WebXR/home.html").includes('href="privacy.html"'), "the homepage footer does not link the privacy page");
  assert(read("tools/bundle_webxr.py").includes('"privacy.html"'), "the flat build does not carry privacy.html");
  const vendors = /\b(okta|auth0|ping ?identity|onelogin|keycloak|entra|azure ad|active directory|cognito|firebase auth|clerk|workos)\b/i;
  for (const f of ["docs/enterprise.md", "WebXR/auth-config.json", "WebXR/shared/org.js", "WebXR/privacy.html", "WebXR/instructor/js/cohort.js"]) assert(!vendors.test(read(f)), `${f} names an identity vendor`);
  assert(/single sign-on/i.test(read("docs/enterprise.md")) && /configuration point/i.test(read("docs/enterprise.md")), "docs/enterprise.md does not document SSO as a configuration point");
});

// ---------------------------------------------------- 8. live, in a browser
// The flat build as it ships (WebXR/dist), served from a temporary port; the
// deployment block is injected by answering the page's own request for
// auth-config.json, so no file is touched. Then a learner joins the sample
// cohort from the sign-in dialog and finds it on the homepage's continue strip.
await check("in a browser: the block on the homepage, in the dialog and in the console; a learner joins from the dialog and sees the cohort on the continue strip", async () => {
  const { createServer } = await import("node:http");
  const { statSync, mkdirSync } = await import("node:fs");
  const { extname, normalize } = await import("node:path");
  const WEBXR = join(ROOT, "WebXR");
  const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const { chromium } = await pwModule();
    browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--no-sandbox"] });
  } catch (e) { server.close(); throw new Error(`could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`); }
  const homeHtml = read("WebXR/dist/index.html");
  const progIds = [...new Set([...homeHtml.matchAll(/data-tr="prog\.([a-z0-9-]+)\./g)].map((m) => m[1]))].filter((id) => PP_PROGRAMMES[id]);
  assert(progIds.length >= 2, "the homepage's finder carries fewer than two passport programmes");
  const block = { organisation: "Harbour Training Hall", signInMethods: ["passkey", "demo"], defaultLanguage: "es", worlds: ["bayworld", "summit"], programmes: progIds.slice(0, 2), dataRetention: "kept on the device only", sso: { note: "verified on the host page" } };
  const shots = process.env.EN_SHOTS ? (mkdirSync(process.env.EN_SHOTS, { recursive: true }), process.env.EN_SHOTS) : null;
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    // The console bundle imports three.js from its CDN (devices.js, eggs-app.js spell THREE.) — served from the
    // vendored copy when there is one, else as an empty module: the Cohorts tab never touches it.
    const three = ["WebXR/vendor/three/three.module.min.js", "WebXR/vendor/three/three.module.js"].find((f) => existsSync(join(ROOT, f)));
    await context.route(/three\.module(\.min)?\.js$/, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: three ? read(three) : "export {};" }));
    await context.route(/auth-config\.json(\?.*)?$/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...JSON.parse(read("WebXR/auth-config.json")), enterprise: block }) }));
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    // The console honours the block and gives us the sample cohort's invite code.
    await page.goto(`${base}/dist/instructor-console.html`, { waitUntil: "load", timeout: 30000 });
    await page.click("#tab-cohort");
    await page.waitForFunction(() => { const l = document.getElementById("en-deployment"); return l && !l.hidden && l.textContent.length > 0; }, null, { timeout: 10000 });
    const consoleLine = await page.evaluate(() => document.getElementById("en-deployment").textContent);
    assert(consoleLine.includes(block.organisation) && /2 programme/.test(consoleLine) && /default language es/.test(consoleLine), `the console's deployment line: ${consoleLine}`);
    await page.click("text=Load sample cohort");
    await page.waitForSelector("code.en-code", { timeout: 5000 });
    const code = await page.evaluate(() => document.querySelector("code.en-code").textContent);
    assert(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code), `invite code ${code}`);
    const picker = await page.evaluate(() => [...document.querySelectorAll("#programme option")].map((o) => o.value).filter(Boolean));
    assert(picker.length === 2 && picker.every((id) => block.programmes.includes(id)), `the console's programme picker lists ${picker.join(", ")}`);
    // The homepage: brand line, hidden worlds, two programmes, Spanish until the visitor picks.
    await page.goto(`${base}/dist/index.html`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.hmEnterprise === "named", null, { timeout: 10000 });
    // The default language arrives through a lazy import of the language layer; give it a moment, not a fixed one.
    await page.waitForFunction(() => document.documentElement.lang === "es", null, { timeout: 10000 }).catch(() => null);
    const home = await page.evaluate(() => {
      const shown = (sel) => [...document.querySelectorAll(sel)].filter((el) => getComputedStyle(el).display !== "none");
      return { brand: document.querySelector(".brandline")?.textContent ?? "", worlds: document.querySelectorAll(".app.world").length, worldsShown: shown(".app.world").length, progs: document.querySelectorAll(".prog").length, progsShown: shown(".prog").length, lang: document.documentElement.lang, cohorts: document.getElementById("hm-cont-cohorts")?.hidden };
    });
    assert(home.brand.includes(block.organisation), `the brand line reads "${home.brand}"`);
    eq(home.worldsShown, 2, `world cards shown of ${home.worlds}`);
    eq(home.progsShown, 2, `programme cards shown of ${home.progs}`);
    eq(home.lang, "es", "the page language before the visitor picks one");
    eq(home.cohorts, true, "the continue strip shows cohorts before any was joined");
    // The dialog: the organisation named, two methods, the join form.
    await page.click("#gt-account");
    await page.waitForFunction(() => { const d = document.getElementById("gt-dialog"); return d && !d.hidden && document.getElementById("gt-join-open"); }, null, { timeout: 10000 });
    const dlg = await page.evaluate(() => ({ org: document.getElementById("gt-org")?.textContent ?? "", methods: [...document.querySelectorAll("#gt-dialog [data-provider]")].map((el) => el.getAttribute("data-provider")), form: document.getElementById("gt-join-form")?.hidden, consent: document.getElementById("gt-join-consent")?.checked }));
    assert(dlg.org.includes(block.organisation), `the dialog says "${dlg.org}"`);
    eq(dlg.methods.sort().join(","), "demo,passkey", "the methods the dialog offers");
    eq(dlg.form, true, "the join form is folded until asked for");
    eq(dlg.consent, false, "the consent box is off by default");
    await page.click("#gt-join-open");
    await page.fill("#gt-join-code", "ZZZZ-ZZZZ"); await page.fill("#gt-join-name", "E. Learner"); await page.click("#gt-join");
    const refused = await page.evaluate(() => document.getElementById("gt-msg").textContent);
    assert(/no cohort/i.test(refused), `a wrong code was not refused: "${refused}"`);
    await page.fill("#gt-join-code", code.toLowerCase()); await page.click("#gt-join");
    await page.waitForSelector("#gt-cohorts .gt-cohort", { timeout: 5000 });
    const joined = await page.evaluate(() => ({ line: document.querySelector("#gt-cohorts .gt-cohort").textContent, msg: document.getElementById("gt-msg").textContent }));
    assert(joined.line.includes("Sample cohort") && joined.line.includes("progress not shared") && /0 of \d+ stations/.test(joined.line), `the dialog's cohort line: ${joined.line}`);
    assert(/joined Sample cohort/.test(joined.msg) && !/shared with/.test(joined.msg), `the join message: ${joined.msg}`);
    if (shots) await page.screenshot({ path: join(shots, "dialog-join.png"), clip: { x: 420, y: 40, width: 440, height: 820 } });
    // Back on the homepage: the card, the ladder, the audit line on this device.
    await page.goto(`${base}/dist/index.html`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => document.getElementById("continue")?.dataset.cohorts === "1", null, { timeout: 10000 });
    const strip = await page.evaluate(async () => {
      const o = await import("./shared/org.js");
      const mine = o.enMyCohorts();
      return { cards: document.querySelectorAll("#hm-cont-cohorts .hm-cont-cohort").length, rungs: document.querySelectorAll("#hm-cont-cohorts .hm-rung").length, text: document.getElementById("hm-cont-cohorts").textContent, stations: mine[0]?.total ?? -1, audit: o.enAuditList().map((a) => a.action), snapshot: (() => { const lm = o.enMembers(mine[0]?.cohort.id).find((m) => m.local); return lm ? lm.progress : "no local member"; })(), sideways: document.documentElement.scrollWidth - innerWidth };
    });
    eq(strip.cards, 1, "cohort cards on the continue strip");
    eq(strip.rungs, strip.stations, "ladder rungs");
    assert(strip.text.includes("Sample cohort") && strip.text.includes("Sample Organisation") && strip.text.includes("progress not shared"), `the card reads: ${strip.text}`);
    eq(strip.audit[0], "member-join", "the join is audited on the learner's device");
    eq(strip.snapshot, null, "a join without consent stores no snapshot");
    assert(strip.sideways <= 1, `the homepage scrolls sideways by ${strip.sideways}px`);
    if (shots) { await page.evaluate(() => document.getElementById("continue").scrollIntoView()); await page.waitForTimeout(200); await page.screenshot({ path: join(shots, "home-my-cohort.png"), fullPage: false }); }
    await context.close();
  } finally { await browser.close(); server.close(); }
  eq(errors.length, 0, `page errors: ${errors.join(" | ")}`);
});

console.log(failures ? `\n${failures} organisation-layer check(s) failed.` : "\nAll organisation-layer checks pass.");
process.exit(failures ? 1 : 0);
