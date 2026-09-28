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
  const home = read("tools/gen_home.mjs");
  assert(home.includes("function hmApplyEnterprise(") && home.includes("hmApplyEnterprise(mod.Auth.config?.enterprise)"), "the homepage script does not apply the block");
  for (const k of ["e.organisation", "e.worlds", "e.programmes", "e.defaultLanguage"]) assert(home.includes(k), `the homepage ignores ${k}`);
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

console.log(failures ? `\n${failures} organisation-layer check(s) failed.` : "\nAll organisation-layer checks pass.");
process.exit(failures ? 1 : 0);
