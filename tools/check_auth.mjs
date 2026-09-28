/**
 * The account chip, the one sign-in dialog, the free demo and the private
 * profile per person (console GATE, tools/briefs/signin-brief.md,
 * docs/sign-in.md). Headless: a small DOM stub, Map-backed storage, a spied
 * fetch and a stubbed window.ethereum.
 *
 *     node tools/check_auth.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failures += 1; console.log(`  ✗ ${name}\n      ${e.stack ?? e}`); }
}
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (a !== b) throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ------------------------------------------------------------ a small DOM
class GtNode {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.parent = null; this.listeners = {}; this.style = { cssText: "", setProperty() {} }; this._text = ""; this.value = ""; this.dataset = {}; }
  get id() { return this.attrs.id ?? ""; }
  set id(v) { this.attrs.id = v; }
  get hidden() { return "hidden" in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ""; else delete this.attrs.hidden; }
  get className() { return this.attrs.class ?? ""; }
  set className(v) { this.attrs.class = v; }
  get disabled() { return "disabled" in this.attrs; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  set textContent(v) { this.children = []; this._text = String(v ?? ""); }
  append(...kids) { for (const k of kids) this.appendChild(typeof k === "string" ? Object.assign(new GtNode("#text"), { _text: k }) : k); }
  appendChild(k) { k.parent?.children.splice(k.parent.children.indexOf(k), 1); k.parent = this; this.children.push(k); return k; }
  prepend(k) { this.appendChild(k); this.children.unshift(this.children.pop()); }
  remove() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
  contains(n) { for (let x = n; x; x = x.parent) if (x === this) return true; return false; }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  removeEventListener() {}
  click() { if (!this.disabled) for (const f of this.listeners.click ?? []) f({ target: this, preventDefault() {}, stopPropagation() {} }); }
  focus() { globalThis.document.activeElement = this; }
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
function freshDom() {
  const html = new GtNode("html"); const head = new GtNode("head"); const body = new GtNode("body");
  html.append(head, body);
  const chip = new GtNode("a"); chip.className = "home-chip"; chip.setAttribute("href", "../index.html"); body.append(chip);
  globalThis.document = {
    head, body, activeElement: body, documentElement: html,
    createElement: (t) => new GtNode(t),
    getElementById: (id) => html.querySelector(`#${id}`),
    querySelector: (s) => html.querySelector(s),
    querySelectorAll: (s) => html.querySelectorAll(s),
    contains: (n) => html.contains(n),
    addEventListener() {},
  };
}

// --------------------------------------------------------- browser stubs
const localStore = new Map(), sessionStore = new Map();
const mkStore = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } });
globalThis.localStorage = mkStore(localStore);
globalThis.sessionStorage = mkStore(sessionStore);
const net = { fetches: [], scripts: 0 };
globalThis.fetch = async (url) => { net.fetches.push(String(url)); return { ok: false, json: async () => ({}) }; };
Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true, writable: true });
globalThis.location = { href: "https://hall.example.org/WebXR/race/index.html", origin: "https://hall.example.org", host: "hall.example.org", search: "", pathname: "/WebXR/race/index.html", hash: "" };
globalThis.window = globalThis;
globalThis.window.parent = globalThis;
const gtEvents = [];
globalThis.addEventListener = (t, f) => gtEvents.push([t, f]);
globalThis.removeEventListener = () => {};
globalThis.dispatchEvent = (e) => { for (const [t, f] of gtEvents) if (t === e.type) f(e); return true; };
globalThis.confirm = () => true;
freshDom();

const auth = await import("../WebXR/shared/auth.js");
const { Auth, makeAuthEnv, EMPTY_AUTH_CONFIG } = auth;
const profiles = await import("../WebXR/shared/profiles.js");
const account = await import("../WebXR/shared/account.js");
const { TrainingRecords } = await import("../WebXR/shared/records.js");
const passport = await import("../WebXR/shared/passport.js");
const career = await import("../WebXR/bayworld/js/career.js");

const WALLET_A = "0xAbCdEf0123456789aBcDeF0123456789AbCdEf01";
const WALLET_B = "0x00000000000000000000000000000000000000b2";
const ethStub = (address, log = []) => ({
  request: async (r) => { log.push(r); return r.method === "eth_requestAccounts" ? [address] : "0xsig"; },
});
const envWith = (o = {}) => makeAuthEnv({ fetch: async (u) => { net.fetches.push(String(u)); return { ok: false }; }, loadScript: async () => { net.scripts += 1; }, ...o });

// -------------------------------------------------------------- 1. static
await check("controls.js mounts the account chip, and every bundle and shared copy carries it", () => {
  const controls = read("WebXR/shared/controls.js");
  assert(/import \{ gtMountAccount \} from "\.\/account\.js";/.test(controls), "controls.js does not import the account chip");
  assert(/gtMountAccount\(nav/.test(controls), "ctlMount never mounts the chip");
  const bundler = read("tools/bundle_webxr.py");
  const apps = (bundler.match(/"modules": \[/g) ?? []).length;
  for (const n of ["profiles.js", "auth.js", "account.js", "controls.js"]) {
    eq((bundler.match(new RegExp(`SHARED / "${n.replace(".", "\\.")}"`, "g")) ?? []).length, apps, `${n} entries across the ${apps} bundles`);
  }
  assert(/"controls\.js", "account\.js", "profiles\.js"/.test(bundler), "the combined dist folder does not copy account.js and profiles.js");
  const dists = readdirSync(join(WEBXR, "dist")).filter((f) => f.endsWith(".html") && f !== "index.html");
  assert(dists.length >= 11, "fewer bundles than expected in WebXR/dist");
  for (const f of dists) assert(read(`WebXR/dist/${f}`).includes('"gt-account"'), `${f} carries no account chip`);
});

await check("the homepage and every training-track page mount the control grammar, so the chip is on them", () => {
  for (const p of ["WebXR/index.html", "WebXR/home.html"]) {
    const html = read(p);
    assert(/import \{ ctlMount \} from "\.\/shared\/controls\.js"; ctlMount\(/.test(html), `${p} does not mount the controls (and so the chip)`);
    assert(/getElementById\("gt-account"\)/.test(html), `${p}'s own Sign in button does not open the shared dialog`);
  }
  const dir = join(WEBXR, "home", "tracks");
  const pages = readdirSync(dir).filter((f) => f.endsWith(".html"));
  assert(pages.length > 10, "no training-track pages found");
  for (const f of pages) assert(/from "\.\.\/shared\/controls\.js"; ctlMount\(/.test(readFileSync(join(dir, f), "utf8")), `track ${f} does not mount the controls`);
});

await check("account.js and profiles.js make no request of their own; MetaMask is text only", () => {
  for (const p of ["WebXR/shared/account.js", "WebXR/shared/profiles.js"]) {
    const code = read(p).replace(/^\s*\/\/.*$/gm, "");
    for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "import(", "<img", "<svg", ".src ="]) {
      assert(!code.includes(api), `${p} reaches for ${api}`);
    }
  }
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n");
  const logos = tracked.filter((f) => /metamask/i.test(f) && /\.(png|jpe?g|svg|gif|webp|ico)$/i.test(f));
  eq(logos.length, 0, `MetaMask logo files in the repo: ${logos.join(", ")}`);
});

await check("the dialog lists Google, MetaMask, e-mail and the demo in that order", () => {
  const src = read("WebXR/shared/account.js");
  const at = ["\"Continue with Google\"", "\"Connect MetaMask\"", "\"E-mail me a link\"", "\"Try the free demo — no sign-in\""].map((s) => src.indexOf(s));
  assert(at.every((i) => i > 0), "an option's label is missing");
  assert(at.every((v, i) => i === 0 || v > at[i - 1]), "the options are out of order");
});

await check("no client id, key, secret or wallet address is committed", () => {
  const cfg = JSON.parse(read("WebXR/auth-config.json"));
  for (const k of ["googleClientId", "microsoftClientId", "microsoftTenant", "emailEndpoint", "walletStatement", "homePage", "mapboxToken"]) eq(cfg[k], null, `auth-config.json ${k}`);
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n")
    .filter((f) => /\.(js|mjs|json|html|md|py|ya?ml|env|txt)$/.test(f) && !f.includes("/dist/") && existsSync(join(ROOT, f)));
  const patterns = [
    [/\b\d{8,}-[a-z0-9]{24,}\.apps\.googleusercontent\.com\b/, "a Google OAuth client id"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
    [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key"],
    [/\bsk_(live|test)_[0-9A-Za-z]{16,}\b/, "a secret API key"],
    [/\bGOCSPX-[0-9A-Za-z_-]{20,}\b/, "a Google client secret"],
    [/\bpk\.eyJ[0-9A-Za-z_-]{20,}\.[0-9A-Za-z_-]{10,}\b/, "a Mapbox token"],
  ];
  for (const f of tracked) {
    const text = readFileSync(join(ROOT, f), "utf8");
    for (const [re, what] of patterns) assert(!re.test(text), `${f} carries ${what}`);
  }
  for (const f of ["WebXR/shared/account.js", "WebXR/shared/profiles.js", "WebXR/shared/auth.js", "WebXR/auth-config.json"]) {
    assert(!/0x[0-9a-fA-F]{40}/.test(read(f)), `${f} carries a wallet address`);
  }
});

// ------------------------------------------------------------- 2. running
await check("with an empty configuration no provider touches the network", async () => {
  net.fetches.length = 0; net.scripts = 0;
  for (const id of ["google", "microsoft", "email", "passkey", "wallet"]) {
    await Auth.signIn(id, { config: EMPTY_AUTH_CONFIG, env: envWith({ ethereum: null, hasPasskey: false, credentials: null }), email: "a@example.org", name: "x" });
  }
  eq(net.fetches.length, 0, "requests made with nothing configured");
  eq(net.scripts, 0, "provider scripts loaded with nothing configured");
  eq(Auth.session, null, "a session appeared from nowhere");
});

await check("the chip mounts beside Home and reads only the same-origin auth-config.json", async () => {
  net.fetches.length = 0;
  const nav = document.createElement("nav"); nav.id = "ctl-nav"; document.body.prepend(nav);
  nav.appendChild(document.querySelector(".home-chip"));
  const chip = account.gtMountAccount(nav);
  await account.gtOpenAccount();
  assert(chip && nav.contains(chip), "no chip in the nav");
  eq(chip.textContent, "Sign in", "the chip's label signed out");
  eq(net.fetches.join(","), "../auth-config.json", "what the chip read");
  eq(account.gtConfigUrlFrom("../../index.html"), "../../auth-config.json", "the config path from a bundle's Home chip");
  eq(account.gtConfigUrlFrom("./index.html"), "auth-config.json", "the config path in the flat dist folder");
  eq(account.gtConfigUrlFrom("https://evil.example/index.html"), "auth-config.json", "an absolute Home link steered the config read");
  const d = document.getElementById("gt-dialog");
  assert(d && !d.hidden, "the dialog did not open");
  eq(d.getAttribute("role"), "dialog", "the dialog's role");
});

await check("Google shows disabled, saying why, without a client id", async () => {
  const g = document.querySelector("#gt-dialog .gt-opt");
  eq(g.getAttribute("data-provider"), "google", "Google is not the first option");
  assert(g.disabled, "the Google option is not disabled");
  assert(g.textContent.includes("Google sign-in is available when this deployment is configured"), "no reason given");
  const line = document.querySelectorAll("#gt-dialog .gt-line").find((n) => n.getAttribute("data-provider") === "wallet");
  assert(line?.textContent.includes("Install MetaMask"), "no wallet: no plain line with an install link");
  eq(net.fetches.length, 1, "opening the dialog made a request beyond the config read");
});

await check("MetaMask builds a valid EIP-4361 message against a stubbed window.ethereum and signs in", async () => {
  const log = [];
  globalThis.window.ethereum = ethStub(WALLET_A, log);
  await account.gtOpenAccount();
  const btn = document.querySelectorAll("#gt-dialog .gt-opt").find((n) => n.getAttribute("data-provider") === "wallet");
  assert(btn && btn.textContent.startsWith("Connect MetaMask"), "no Connect MetaMask button with a wallet present");
  btn.click();
  for (let i = 0; i < 20 && !Auth.session; i += 1) await new Promise((r) => setTimeout(r, 5));
  eq(Auth.session?.id, `eip155:1:${WALLET_A}`, "the session");
  const sign = log.find((r) => r.method === "personal_sign");
  const lines = sign.params[0].split("\n");
  eq(lines[0], "hall.example.org wants you to sign in with your Ethereum account:", "EIP-4361 line 1");
  eq(lines[1], WALLET_A, "EIP-4361 address line");
  for (const [i, prefix] of [[lines.length - 5, "URI: "], [lines.length - 4, "Version: 1"], [lines.length - 3, "Chain ID: 1"], [lines.length - 2, "Nonce: "], [lines.length - 1, "Issued At: "]]) {
    assert(lines[i].startsWith(prefix), `EIP-4361 field ${prefix.trim()} out of place`);
  }
  assert(/^Nonce: [0-9a-f]{16,}$/.test(lines[lines.length - 2]), "the nonce is not alphanumeric and long enough");
  eq(sign.params[1], WALLET_A, "signed for another address");
  assert(document.getElementById("gt-account").textContent.startsWith("0xAbCd"), "the chip does not show who is signed in");
  eq(net.fetches.length, 1, "the wallet path made a request");
  Auth.signOut();
  delete globalThis.window.ethereum;
});

await check("the migration adopts existing device data once, in place, and never deletes it", async () => {
  const seeded = JSON.stringify([{ id: "old-1", at: "2026-01-01T00:00:00Z", simId: "charge-point", stars: 3, passed: true }]);
  localStore.set("vr-training-records-v1", seeded);
  localStore.set("bayworld-career-v1", JSON.stringify({ reputation: 7, credits: 70 }));
  localStore.delete(profiles.GT_REGISTRY_KEY);
  eq(TrainingRecords.count(), 1, "the device's existing record is not shown signed out");
  await Auth.signIn("wallet", { config: EMPTY_AUTH_CONFIG, env: envWith({ ethereum: ethStub(WALLET_A) }) });
  eq(TrainingRecords.count(), 0, "a signed-in person sees the device's records");
  const reg = JSON.parse(localStore.get(profiles.GT_REGISTRY_KEY) ?? "null");
  eq(reg?.device?.label, "This device", "the This device profile was not recorded");
  assert(reg.device.keys.includes("vr-training-records-v1") && reg.device.keys.includes("bayworld-career-v1"), "the adopted stores were not listed");
  eq(localStore.get("vr-training-records-v1"), seeded, "the migration touched the existing records");
  profiles.gtMigrateOnce();
  eq(JSON.parse(localStore.get(profiles.GT_REGISTRY_KEY)).device.adoptedAt, reg.device.adoptedAt, "the migration ran twice");
  Auth.signOut();
  eq(TrainingRecords.count(), 1, "signing out did not bring the device's records back");
  eq(career.bwCareerState().reputation, 7, "the device's career did not come back");
});

await check("two identities on one device see separate progress, and no raw address is a key", async () => {
  const inAs = (addr) => Auth.signIn("wallet", { config: EMPTY_AUTH_CONFIG, env: envWith({ ethereum: ethStub(addr) }) });
  await inAs(WALLET_A);
  TrainingRecords.record({ simId: "charge-point", stars: 3, category: "Energy & Power" });
  career.bwAwardMission({ passed: true, stars: 3, siteId: "hunters-point", siteName: "Hunters Point" });
  const aRep = career.bwCareerState().reputation;
  assert(aRep > 0, "the career award did not land");
  Auth.signOut();
  await inAs(WALLET_B);
  eq(TrainingRecords.count(), 0, "B sees A's records");
  eq(career.bwCareerState().reputation, 0, "B sees A's career");
  TrainingRecords.record({ simId: "lockout", stars: 2, category: "Energy & Power" });
  TrainingRecords.record({ simId: "lockout", stars: 3, category: "Energy & Power" });
  Auth.signOut();
  await inAs(WALLET_A);
  eq(TrainingRecords.count(), 1, "A's records changed while B was signed in");
  eq(career.bwCareerState().reputation, aRep, "A's career changed while B was signed in");
  Auth.signOut();
  eq(TrainingRecords.count(), 1, "the This device profile picked up someone's records");
  for (const k of localStore.keys()) {
    for (const raw of [WALLET_A, WALLET_B]) assert(!k.toLowerCase().includes(raw.toLowerCase().slice(2)), `a raw address is part of the key ${k}`);
    assert(!k.includes("@"), `an e-mail address is part of the key ${k}`);
  }
  const hashA = profiles.gtHashId(`eip155:1:${WALLET_A}`);
  assert(/^id-[0-9a-f]{16}$/.test(hashA), "the namespace is not a digest");
  assert([...localStore.keys()].some((k) => k.endsWith(`::${hashA}`)), "A's namespace was never used");
});

await check("the free demo writes nothing to localStorage, badges the chip and says so on results", async () => {
  const before = JSON.stringify([...localStore.entries()]);
  const nav = document.getElementById("ctl-nav");
  const demoBtn = (await account.gtOpenAccount(), document.querySelectorAll("#gt-dialog .gt-opt").find((n) => n.getAttribute("data-provider") === "demo"));
  assert(demoBtn?.textContent.startsWith("Try the free demo — no sign-in"), "no demo option");
  demoBtn.click();
  assert(profiles.gtIsDemo(), "the demo did not start");
  assert(nav.querySelector("#gt-account .gt-badge")?.textContent === "Demo", "no Demo badge on the chip");
  eq(TrainingRecords.count(), 0, "the demo shows the device's records");
  TrainingRecords.record({ simId: "charge-point", stars: 3, category: "Energy & Power" });
  career.bwAwardMission({ passed: true, stars: 3, siteId: "hunters-point", siteName: "Hunters Point" });
  passport.ppAward?.({ id: "demo-award", source: "bayworld", title: "Demo" });
  eq(TrainingRecords.count(), 1, "the demo run was not kept for the tab");
  assert(document.getElementById("gt-demo-note")?.textContent.includes("Demo run — sign in to keep it"), "the results screen does not say it is a demo run");
  eq(JSON.stringify([...localStore.entries()]), before, "the demo wrote to localStorage");
  assert([...sessionStore.keys()].some((k) => k.endsWith("::demo")), "the demo kept nothing in the tab");
});

await check("signing in from the demo offers to carry its runs over (default off), and the button does", async () => {
  globalThis.window.ethereum = ethStub(WALLET_B);
  await account.gtOpenAccount();
  document.querySelectorAll("#gt-dialog .gt-opt").find((n) => n.getAttribute("data-provider") === "wallet").click();
  for (let i = 0; i < 20 && !document.getElementById("gt-carry"); i += 1) await new Promise((r) => setTimeout(r, 5));
  assert(document.getElementById("gt-carry"), "no Keep my demo runs button");
  assert(!profiles.gtIsDemo(), "signing in did not end the demo");
  eq(TrainingRecords.count(), 2, "demo runs were carried over without the button (B had two)");
  document.getElementById("gt-carry").click();
  eq(TrainingRecords.count(), 3, "the button did not carry the demo run over");
  eq([...sessionStore.keys()].filter((k) => k.endsWith("::demo")).length, 0, "the demo copy survived the carry-over");
  Auth.signOut();
  delete globalThis.window.ethereum;
});

await check("exports never carry the signed-in identity's raw value from a storage key", () => {
  const share = read("WebXR/shared/share-engagement.js");
  assert(!share.includes("vr-training-auth-v1") && !/Auth\.session/.test(share), "the share path reads the sign-in session");
  const prof = read("WebXR/shared/profiles.js");
  assert(/gtHashId/.test(prof) && /gtFnv1a\(`\$\{salt\}:\$\{t\}`\)/.test(prof), "the namespace is not the salted hashCrewTag-style digest");
});

console.log(failures === 0 ? "\nAll account, demo and private-profile checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
