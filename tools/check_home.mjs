/**
 * Headless checks for the homepage and the sign-in module.
 *
 *     node tools/check_home.mjs
 *
 * Three things are proved here, none of which the other checkers can see:
 *
 *  1. **The homepage reaches everything.** Every station in the catalog has a
 *     card with a deep link, every app has an entry, every programme has a
 *     rail, and every relative link in both generated variants resolves to a
 *     file that exists. A station added tomorrow that nobody linked is a
 *     failure here, because tools/gen_catalog.mjs regenerates the page.
 *  2. **Catalog strings reach the page as text only.** No station name,
 *     tagline, trade, certification or category may appear inside an attribute
 *     value; the only catalog-derived attribute values are slug ids in deep
 *     links and hex accents in a custom property. The generator is then run
 *     against a hostile fixture — a station whose every field carries markup —
 *     and the page must come out with the same tag structure as the clean one.
 *  3. **shared/auth.js never contacts an endpoint that was not configured.**
 *     Statically: every absolute URL lives in one table, and there are exactly
 *     three fetch call sites, all named. At runtime: every provider is driven
 *     twice with stubs — a happy path and a refusal path — and in the empty
 *     configuration the network spies must record nothing at all.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

// ---------------------------------------------------------------- HTML pieces

/** Every attribute value in the document, with its attribute name. */
function attributeValues(html) {
  const out = [];
  for (const tag of html.match(/<[a-zA-Z][^>]*>/g) ?? []) {
    for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) out.push({ name: m[1], value: m[2] });
  }
  return out;
}

/** Everything outside a tag: the text a reader actually sees, still escaped. */
function textOnly(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]*>/g, "\u0001").replace(/\s+/g, " ");
}

function escapeForHtml(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Relative link targets: href/src attributes plus dynamic import specifiers. */
function relativeLinks(html) {
  const out = [];
  for (const { name, value } of attributeValues(html)) {
    if (name !== "href" && name !== "src") continue;
    if (/^(https?:|mailto:|data:|#|\/\/)/.test(value) || value === "") continue;
    out.push(value);
  }
  for (const m of html.matchAll(/import\(\s*"(\.[^"]+)"\s*\)/g)) out.push(m[1]);
  return out;
}

const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const devicesMd = readFileSync(join(ROOT, "docs", "devices.md"), "utf8");
const home = readFileSync(join(WEBXR, "index.html"), "utf8");
const flat = readFileSync(join(WEBXR, "home.html"), "utf8");
const gen = await import("./gen_home.mjs");

console.log("Homepage and sign-in — self-test\n");

// ------------------------------------------------------------ 1. reachability

await check("the homepage is the generated one, and the generator runs from gen_catalog.mjs", () => {
  assert(home.includes('content="tools/gen_home.mjs"'), "WebXR/index.html was not written by tools/gen_home.mjs");
  const genCatalog = readFileSync(join(ROOT, "tools", "gen_catalog.mjs"), "utf8");
  assert(/gen_home\.mjs/.test(genCatalog), "tools/gen_catalog.mjs does not run tools/gen_home.mjs, so the page will drift");
  eq(gen.renderHome(catalog, devicesMd, "repo"), home, "WebXR/index.html is stale — run node tools/gen_home.mjs");
  eq(gen.renderHome(catalog, devicesMd, "flat"), flat, "WebXR/home.html is stale — run node tools/gen_home.mjs");
});

await check("every catalog station has a deep link on both variants", () => {
  const missing = [];
  for (const station of catalog.stations) {
    const repoHref = station.app === "trades" ? `trades/index.html?room=${station.id}` : `smartcity/index.html?sim=${station.id}`;
    const flatHref = station.app === "trades" ? `trade-skills-simulator.html?room=${station.id}` : `smartcity-x.html?sim=${station.id}`;
    if (!home.includes(`href="${repoHref}"`)) missing.push(`index.html → ${station.id}`);
    if (!flat.includes(`href="${flatHref}"`)) missing.push(`home.html → ${station.id}`);
  }
  assert(missing.length === 0, `${missing.length} station link(s) missing, e.g. ${missing.slice(0, 4).join(", ")}`);
  eq((home.match(/class="card"/g) ?? []).length, catalog.stations.length, "cards on the page");
});

await check("every station's name, trade and tagline are on the page as readable text", () => {
  const text = textOnly(home);
  const thin = [];
  for (const station of catalog.stations) {
    for (const field of ["name", "trade", "tagline"]) {
      const value = station[field];
      if (!value) continue;
      if (!text.includes(escapeForHtml(value))) thin.push(`${station.id}.${field}`);
    }
  }
  assert(thin.length === 0, `${thin.length} field(s) never rendered, e.g. ${thin.slice(0, 4).join(", ")}`);
});

await check("every app, the instructor console and every programme are linked", () => {
  for (const [app, meta] of Object.entries(catalog.apps)) {
    if (app === "portal") { assert(home.includes(`href="portal/index.html"`), "the portal is not linked"); continue; }
    assert(home.includes(`href="${meta.entry}"`), `${app} (${meta.entry}) is not linked from the homepage`);
  }
  assert(home.includes(`href="instructor/index.html"`), "the instructor console is not linked");
  assert(home.includes(`href="verify/index.html"`), "the credential verifier is not linked");
  assert(home.includes(`href="campus/index.html"`), "the Safety Campus page is not linked");
  const missing = catalog.curricula.filter((c) => !home.includes(`?programme=${c.id}"`)).map((c) => c.id);
  assert(missing.length === 0, `programme rail missing: ${missing.slice(0, 4).join(", ")}`);
  // A programme link is only worth making if the app acts on it.
  const app = readFileSync(join(WEBXR, "smartcity", "js", "app.js"), "utf8");
  assert(/get\("programme"\)/.test(app), "SmartCiti.X does not read ?programme=, so the rail links nowhere useful");
});

await check("the homepage carries a search box, a sign-in button and the device line", () => {
  assert(/<input id="q"[^>]*type="search"/.test(home), "no search input");
  for (const word of ["id", "name", "trade", "category", "standard"]) {
    assert(new RegExp(`placeholder="[^"]*"`).test(home), "the search box has no placeholder");
    assert(home.toLowerCase().includes(word), `the search box never mentions ${word}`);
  }
  assert(home.includes('id="signin"'), "no Sign in button on the homepage");
  assert(home.includes('id="signin-dialog"'), "no sign-in dialog on the homepage");
  // Named devices, counted classes and profiles — all read out of docs/devices.md.
  const line = gen.deviceLine(devicesMd);
  assert(/desktop, tablet or phone browser/.test(line), "the device line does not name the flat surfaces");
  assert(/Meta Quest 3 \(VR headsets\)/.test(line), "the device line does not name the VR fleet headset from docs/devices.md");
  assert(/RealWear/.test(line), "the device line does not name a hardhat monocular from docs/devices.md");
  assert(home.includes(escapeForHtml(line)), "the generated device line is not on the page");
});

await check("the SmartCiti.X toolbar carries the same Sign in option", () => {
  const ui = readFileSync(join(WEBXR, "smartcity", "js", "react-ui.js"), "utf8");
  assert(/id: "open-signin", label: "Sign in", action: "viewSignIn"/.test(ui), "the intro toolbar has no Sign in button");
  assert(/function SignInCard/.test(ui), "there is no sign-in dialog in the SmartCiti.X UI");
  assert(/h\(SignInCard\)/.test(ui), "the sign-in dialog is never mounted");
  const app = readFileSync(join(WEBXR, "smartcity", "js", "app.js"), "utf8");
  for (const action of ["viewSignIn", "closeSignIn", "signInWith", "setSignInField", "signOutOfAuth"]) {
    assert(app.includes(`function ${action}`) || app.includes(`${action},`), `app.js never defines ${action}`);
  }
});

await check("no broken relative link on either variant", () => {
  // Each variant is resolved from where it is actually served: the repository
  // page from WebXR/, the flat page from the combined bundle folder it is
  // copied into, where every app is one HTML file beside it.
  const bases = [["WebXR/index.html", home, WEBXR], ["WebXR/home.html", flat, join(WEBXR, "dist")]];
  const broken = [];
  for (const [file, html, base] of bases) {
    assert(existsSync(base), `${base} does not exist — run python3 tools/bundle_webxr.py`);
    for (const link of new Set(relativeLinks(html))) {
      const target = resolve(base, link.split(/[?#]/)[0]);
      if (!existsSync(target)) broken.push(`${file} → ${link}`);
    }
  }
  assert(broken.length === 0, `${broken.length} broken link(s): ${broken.slice(0, 6).join(", ")}`);
});

await check("the flat variant links no repository-only path, and the dist copy matches it", () => {
  assert(!flat.includes("../docs/"), "the flat variant links ../docs/, which does not exist beside a bundle");
  for (const page of ["smartcity-x.html?sim=", "trade-skills-simulator.html", "holodeck.html", "instructor-console.html"]) {
    assert(flat.includes(page), `the flat variant never links ${page}`);
  }
  const dist = join(WEBXR, "dist", "index.html");
  if (existsSync(dist)) eq(readFileSync(dist, "utf8"), flat, "WebXR/dist/index.html is stale — run python3 tools/bundle_webxr.py");
});

// --------------------------------------------------------- 2. text-node rule

await check("no catalog string reaches an attribute value", () => {
  const values = attributeValues(home).map((a) => a.value);
  const leaked = [];
  for (const station of catalog.stations) {
    for (const field of ["name", "tagline", "trade", "certification", "category"]) {
      const value = station[field];
      if (!value || value.length < 5) continue;
      if (values.some((v) => v.includes(value))) leaked.push(`${station.id}.${field}`);
    }
  }
  for (const c of catalog.curricula) {
    if (values.some((v) => v.includes(c.name))) leaked.push(`programme ${c.id}.name`);
  }
  assert(leaked.length === 0, `${leaked.length} catalog string(s) in an attribute, e.g. ${leaked.slice(0, 4).join(", ")}`);
});

await check("the only catalog-derived attribute values are slug ids and hex accents", () => {
  const ids = new Set(catalog.stations.map((s) => s.id));
  const programmes = new Set(catalog.curricula.map((c) => c.id));
  const accents = new Set(catalog.stations.map((s) => String(s.accent ?? "").toLowerCase()));
  for (const { name, value } of attributeValues(home)) {
    if (name === "href") {
      const q = /[?&](sim|room|programme)=([^&"]*)$/.exec(value);
      if (!q) continue;
      const known = q[1] === "programme" ? programmes.has(q[2]) : ids.has(q[2]);
      assert(known, `deep link ${value} names something that is not in the catalog`);
      assert(/^[a-z0-9-]+$/.test(q[2]), `deep link ${value} is not a plain slug`);
    }
    if (name === "style") {
      const tint = /^--tint:(.+)$/.exec(value);
      if (!tint) continue;
      assert(/^#[0-9a-f]{6}$/.test(tint[1]) || tint[1] === "var(--accent)", `accent ${tint[1]} is not a hex colour`);
    }
  }
  // And each station card's accent is that station's own, not just some hex.
  const wrong = catalog.stations.filter((s) => {
    const href = s.app === "trades" ? `trades/index.html?room=${s.id}` : `smartcity/index.html?sim=${s.id}`;
    return !home.includes(`style="--tint:${String(s.accent).toLowerCase()}" href="${href}"`);
  }).map((s) => s.id);
  assert(wrong.length === 0, `${wrong.length} card(s) carry an accent that is not the station's, e.g. ${wrong.slice(0, 3).join(", ")}`);
  assert(accents.size > 1, "the catalog carries no accents to check");
});

await check("a station whose every field carries markup cannot change the page's structure", () => {
  const hostile = JSON.parse(JSON.stringify(catalog));
  const victim = hostile.stations.find((s) => s.app === "smartcity");
  const payload = `"><img src=x onerror=alert(1)></a><script>alert(2)</script>`;
  victim.name = `Boom ${payload}`;
  victim.tagline = `Tagline ${payload}`;
  victim.trade = `Trade & ${payload}`;
  victim.certification = `Cert ${payload}`;
  const dirty = gen.renderHome(hostile, devicesMd, "repo");
  const tags = (html) => (html.match(/<[a-zA-Z/][^>]*>/g) ?? []).length;
  eq(tags(dirty), tags(home), "the hostile fixture changed the number of tags in the page");
  eq((dirty.match(/<script/g) ?? []).length, (home.match(/<script/g) ?? []).length, "script tags in the page");
  assert(!dirty.includes("<img"), "the hostile name produced a real <img> tag");
  assert(dirty.includes("&lt;img src=x onerror=alert(1)&gt;"), "the hostile name was not escaped into text");
  assert(dirty.includes("Trade &amp; &quot;&gt;&lt;img"), "the ampersand and quote were not escaped");
  // And the two attribute-bound fields refuse rather than escape.
  const badId = JSON.parse(JSON.stringify(catalog));
  const evil = 'x" onmouseover=alert(1) x="';
  const target = badId.stations.find((s) => s.app === "smartcity");
  for (const cat of badId.categories) {
    cat.stations = cat.stations.map((id) => (id === target.id ? evil : id));
  }
  target.id = evil;
  let threw = false;
  try { gen.renderHome(badId, devicesMd, "repo"); } catch (_) { threw = true; }
  assert(threw, "a station id that is not a slug did not fail the build");
  const badAccent = JSON.parse(JSON.stringify(catalog));
  badAccent.stations.find((s) => s.app === "smartcity").accent = "red; background:url(x)";
  assert(gen.renderHome(badAccent, devicesMd, "repo").includes("--tint:var(--accent)"), "a bad accent was not replaced by the token");
});

// ----------------------------------------------------- 3. auth.js, statically

const authSrc = readFileSync(join(WEBXR, "shared", "auth.js"), "utf8");

/** Comments out, so a URL in a sentence is not read as a call. */
function codeOnly(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((l) => l.replace(/^\s*\/\/.*$/, "")).join("\n");
}

await check("every absolute URL in auth.js lives in the one ENDPOINTS table", () => {
  const code = codeOnly(authSrc);
  const table = /const ENDPOINTS = \{[\s\S]*?\n\};/.exec(code);
  assert(table, "auth.js has no ENDPOINTS table");
  const outside = code.replace(table[0], " ");
  const strays = [...outside.matchAll(/"(https?:\/\/[^"]*)"/g)].map((m) => m[1]);
  assert(strays.length === 0, `absolute URL(s) outside the table: ${strays.join(", ")}`);
  eq([...table[0].matchAll(/"(https?:\/\/[^"]*)"/g)].length, 3, "URLs in the table");
  for (const key of ["googleScript", "msalScript", "msAuthority"]) assert(table[0].includes(key), `the table has no ${key}`);
});

await check("auth.js has exactly three fetch call sites and no other network API", () => {
  const code = codeOnly(authSrc);
  const sites = [...code.matchAll(/(\w+)\.fetch\(\s*([A-Za-z_$][\w$.]*|\.\.\.\w+)/g)].map((m) => `${m[1]}.fetch(${m[2]})`);
  const allowed = new Set(["g.fetch(...a)", "env.fetch(configUrl)", "env.fetch(endpoint)"]);
  for (const site of sites) assert(allowed.has(site), `unexpected network call: ${site}`);
  for (const site of allowed) assert(sites.includes(site), `expected call site is gone: ${site}`);
  eq((code.match(/\bfetch\s*\(/g) ?? []).length, sites.length, "bare fetch( calls beyond the three named ones");
  for (const api of ["XMLHttpRequest", "sendBeacon", "EventSource", "WebSocket", "new Image"]) {
    assert(!code.includes(api), `auth.js reaches for ${api}`);
  }
  // The config URL is same-origin and relative, so reading it is reading the
  // page's own folder — and a page-supplied path cannot escape that.
  const url = /const AUTH_CONFIG_URL = "([^"]*)"/.exec(code);
  assert(url, "no AUTH_CONFIG_URL");
  assert(!url[1].includes("//") && !url[1].includes(":") && !url[1].startsWith("/"), `the config URL is not relative: ${url[1]}`);
  assert(/const configUrl = cleanConfigUrl\(env\.configUrl\) \?\? AUTH_CONFIG_URL;/.test(code),
    "the configuration path is not passed through cleanConfigUrl");
  // Each page that is not beside the config says where its copy is.
  const cityApp = readFileSync(join(WEBXR, "smartcity", "js", "app.js"), "utf8");
  assert(/makeAuthEnv\(\{ configUrl: "\.\.\/auth-config\.json" \}\)/.test(cityApp),
    "SmartCiti.X does not point at the deployment's auth-config.json, so it would ask for one beside itself");
  // The e-mail POST is guarded by a return on the line above it.
  assert(/if \(!endpoint\) return startPasskey\(ctx\);/.test(code), "the e-mail branch does not refuse an unconfigured endpoint");
});

await check("auth.js is in the three simulator bundles", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  eq((bundler.match(/SHARED \/ "auth\.js"/g) ?? []).length, 3, "auth.js entries in the bundler's module lists");
});

// ------------------------------------------------------ 3b. auth.js, running

// Browser stubs: the same shape check_identity.mjs uses, plus a store for the
// one versioned key and the records key sign-out can clear.
const localStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
};
const sessionStore = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
};
globalThis.location = { href: "https://hall.example.org/WebXR/index.html", origin: "https://hall.example.org", host: "hall.example.org", search: "", pathname: "/WebXR/index.html", hash: "" };
const posted = [];
globalThis.window = { parent: { postMessage: (msg, target) => posted.push({ msg, target }) } };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};

const auth = await import("../WebXR/shared/auth.js");
const { Auth, PROVIDERS, EMPTY_AUTH_CONFIG, availableProviders, providerById, buildSiweMessage, parseAuthConfig } = auth;

/** An environment that records every attempt to touch the outside world. */
function spyEnv(overrides = {}) {
  const spy = { fetches: [], scripts: [], wallet: 0, passkeys: 0 };
  const env = {
    href: "https://hall.example.org/WebXR/index.html", origin: "https://hall.example.org", host: "hall.example.org",
    search: "", ethereum: null, hasPasskey: false, credentials: null, crypto: null, google: null, msal: null,
    now: () => "2026-01-02T03:04:05Z",
    fetch: async (url, init) => { spy.fetches.push({ url, init }); return { ok: false, json: async () => ({}) }; },
    loadScript: async (src) => { spy.scripts.push(src); throw new Error("blocked"); },
    ...overrides,
  };
  return { env, spy };
}

function jwt(payload) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "RS256" })}.${b64(payload)}.signature-not-checked-here`;
}

await check("a page's configuration path may only ever be relative to this origin", async () => {
  for (const bad of ["https://evil.example/c.json", "//evil.example/c.json", "/etc/passwd", "http://a/b", "javascript:1"]) {
    eq(auth.cleanConfigUrl(bad), null, `cleanConfigUrl accepted ${bad}`);
  }
  eq(auth.cleanConfigUrl("../auth-config.json"), "../auth-config.json", "a relative config path was refused");
  // A hostile configUrl falls back to the default, and the request that is made
  // is that default and nothing else.
  const asked = [];
  await Auth.loadConfig({
    configUrl: "https://evil.example/steal.json", search: "",
    fetch: async (url) => { asked.push(url); return { ok: false, json: async () => ({}) }; },
  });
  eq(asked.join(","), "auth-config.json", "the configuration was read from somewhere it should not be");
});

await check("with nothing configured, no provider touches the network", async () => {
  const { env, spy } = spyEnv();
  Auth.config = EMPTY_AUTH_CONFIG;
  for (const provider of PROVIDERS) {
    const result = await Auth.signIn(provider.id, { config: EMPTY_AUTH_CONFIG, env });
    eq(result.kind, "refused", `${provider.id} in an unconfigured deployment`);
    assert(result.reason && result.reason.length > 10, `${provider.id} refused without saying why`);
  }
  // And the branches themselves, called directly, rather than only the registry gate.
  for (const id of ["google", "microsoft", "email", "passkey", "wallet"]) {
    const result = await providerById(id).start({ config: EMPTY_AUTH_CONFIG, env });
    eq(result.kind, "refused", `${id}.start() with an empty config`);
  }
  eq(spy.fetches.length, 0, "requests made with nothing configured");
  eq(spy.scripts.length, 0, "provider scripts loaded with nothing configured");
  eq(Auth.session, null, "a session appeared from nowhere");
});

await check("only the configured and possible options are offered", () => {
  const { env } = spyEnv();
  eq(availableProviders(EMPTY_AUTH_CONFIG, env).length, 0, "options with nothing configured and no capability");
  const withWallet = spyEnv({ ethereum: { request: async () => [] } }).env;
  eq(availableProviders(EMPTY_AUTH_CONFIG, withWallet).map((p) => p.id).join(","), "wallet", "wallet only when window.ethereum exists");
  const withPasskey = spyEnv({ hasPasskey: true, credentials: {} }).env;
  eq(availableProviders(EMPTY_AUTH_CONFIG, withPasskey).map((p) => p.id).join(","), "passkey", "passkey only when PublicKeyCredential exists");
  const configured = parseAuthConfig({
    googleClientId: "1234567890-abcdefg.apps.googleusercontent.com",
    microsoftClientId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", microsoftTenant: "common",
    emailEndpoint: "https://links.example.org/magic", learner_home: "https://hall.example.org/x",
  });
  eq(configured.homePage, "https://hall.example.org", "the home origin is cleaned to an origin");
  const ids = availableProviders(configured, withPasskey).map((p) => p.id);
  eq(ids.join(","), "google,microsoft,email", "with an e-mail endpoint the passkey fallback is not also offered");
  eq(parseAuthConfig({ emailEndpoint: "http://links.example.org/magic" }).emailEndpoint, null, "plain http endpoint refused");
  eq(parseAuthConfig({ googleClientId: "<img src=x>" }).googleClientId, null, "a client id carrying markup refused");
});

await check("google: a credential signs in, a dismissal refuses, and only its own script loads", async () => {
  const token = jwt({ sub: "g-1815", name: "Ada Lovelace", email: "ada@example.org" });
  const gis = (credential) => ({ accounts: { id: {
    initialize: (o) => { gis.cb = o.callback; }, renderButton: () => {},
    prompt: () => { gis.cb({ credential }); },
  } } });
  const config = parseAuthConfig({ googleClientId: "1234567890-abcdefg.apps.googleusercontent.com" });
  const happy = spyEnv({ google: gis(token), loadScript: async (src) => { happy.spy.scripts.push(src); return true; } });
  const ok = await Auth.signIn("google", { config, env: happy.env });
  eq(ok.kind, "signed-in", "google happy path");
  eq(ok.session.id, "google:g-1815", "subject becomes the learner id");
  eq(ok.session.name, "Ada Lovelace", "display name");
  eq(ok.session.token, token, "the raw token is kept for the host to verify");
  eq(ok.session.verifiedBy, "host-server", "where it is verified");
  eq(happy.spy.fetches.length, 0, "google made a request of its own");
  eq(happy.spy.scripts.join(","), "https://accounts.google.com/gsi/client", "scripts loaded");
  const dismissed = spyEnv({ google: gis(null), loadScript: async () => true });
  const no = await Auth.signIn("google", { config, env: dismissed.env });
  eq(no.kind, "refused", "google refusal path");
  eq(dismissed.spy.fetches.length, 0, "a dismissal still made a request");
});

await check("microsoft: a returning redirect signs in, a first visit redirects", async () => {
  const config = parseAuthConfig({ microsoftClientId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", microsoftTenant: "common" });
  const lib = (result, redirects) => ({ PublicClientApplication: class {
    constructor(opts) { this.opts = opts; redirects.authority = opts.auth.authority; }
    async initialize() {}
    async handleRedirectPromise() { return result; }
    getAllAccounts() { return []; }
    async loginRedirect(req) { redirects.push(req); }
  } });
  const back = [];
  const returning = spyEnv({ msal: lib({ account: { homeAccountId: "ms-1906", name: "Grace Hopper" }, idToken: "id-token" }, back), loadScript: async () => true });
  const ok = await Auth.signIn("microsoft", { config, env: returning.env });
  eq(ok.kind, "signed-in", "microsoft happy path");
  eq(ok.session.id, "microsoft:ms-1906", "account id");
  eq(ok.session.token, "id-token", "the id token is kept for the host to verify");
  eq(back.authority, "https://login.microsoftonline.com/common", "authority built from the tenant");
  const first = [];
  const firstVisit = spyEnv({ msal: lib(null, first), loadScript: async () => true });
  const pending = await Auth.signIn("microsoft", { config, env: firstVisit.env });
  eq(pending.kind, "pending", "microsoft first visit redirects");
  eq(first.length, 1, "loginRedirect calls");
  eq(firstVisit.spy.fetches.length, 0, "microsoft made a request of its own");
});

await check("email: the magic link posts to the configured endpoint and nowhere else", async () => {
  const endpoint = "https://links.example.org/magic";
  const config = parseAuthConfig({ emailEndpoint: endpoint });
  const happy = spyEnv({ fetch: async (url, init) => { happy.spy.fetches.push({ url, init }); return { ok: true }; } });
  const ok = await Auth.signIn("email", { config, env: happy.env, email: "ada@example.org" });
  eq(ok.kind, "pending", "the magic link is pending until the learner opens it");
  eq(happy.spy.fetches.length, 1, "requests");
  eq(happy.spy.fetches[0].url, endpoint, "the request went somewhere else");
  eq(happy.spy.fetches[0].init.method, "POST", "method");
  assert(JSON.parse(happy.spy.fetches[0].init.body).email === "ada@example.org", "the address was not sent");
  const bad = spyEnv();
  const no = await Auth.signIn("email", { config, env: bad.env, email: "not-an-address" });
  eq(no.kind, "refused", "a malformed address is refused");
  eq(bad.spy.fetches.length, 0, "a malformed address was still posted");
});

await check("passkey: a device credential signs in as this device only, a cancellation refuses", async () => {
  const rawId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const made = [];
  const happy = spyEnv({
    hasPasskey: true, crypto: { getRandomValues: (a) => a },
    credentials: { create: async (o) => { made.push(o); return { rawId }; }, get: async () => ({ rawId }) },
  });
  const ok = await Auth.signIn("passkey", { config: EMPTY_AUTH_CONFIG, env: happy.env, name: "Bay 3 kiosk" });
  eq(ok.kind, "signed-in", "passkey happy path");
  eq(ok.session.verifiedBy, "this-device-only", "a passkey is never verified elsewhere");
  eq(ok.session.name, "Bay 3 kiosk", "the passkey's label");
  eq(ok.session.token, null, "a passkey hands out no token");
  eq(made[0].publicKey.rp.id, "hall.example.org", "the credential is bound to this origin");
  eq(happy.spy.fetches.length, 0, "a passkey made a request");
  const refused = spyEnv({
    hasPasskey: true, crypto: { getRandomValues: (a) => a },
    credentials: { create: async () => { throw new Error("NotAllowedError"); } },
  });
  const no = await Auth.signIn("passkey", { config: EMPTY_AUTH_CONFIG, env: refused.env, name: "Bay 3 kiosk" });
  eq(no.kind, "refused", "a cancelled prompt refuses");
  eq(refused.spy.fetches.length, 0, "a cancelled prompt made a request");
});

await check("wallet: an EIP-4361 message is signed and the address becomes the id", async () => {
  const address = "0x1234567890abcdef1234567890ABCDEF12345678";
  const seen = [];
  const happy = spyEnv({ ethereum: { request: async (r) => {
    seen.push(r);
    if (r.method === "eth_requestAccounts") return [address];
    if (r.method === "personal_sign") return "0xsignature";
    return null;
  } } });
  const ok = await Auth.signIn("wallet", { config: EMPTY_AUTH_CONFIG, env: happy.env });
  eq(ok.kind, "signed-in", "wallet happy path");
  eq(ok.session.id, `eip155:1:${address}`, "the address the wallet returned is the id");
  eq(ok.session.verifiedBy, "host-server", "a signature is verified on the host's server");
  const message = seen[1].params[0];
  assert(message.startsWith("hall.example.org wants you to sign in with your Ethereum account:\n" + address),
    `EIP-4361 preamble wrong:\n${message}`);
  for (const field of ["URI: https://hall.example.org/WebXR/index.html", "Version: 1", "Chain ID: 1", "Nonce: ", "Issued At: 2026-01-02T03:04:05Z"]) {
    assert(message.includes(field), `the message is missing ${field}`);
  }
  eq(happy.spy.fetches.length, 0, "the wallet path made a request");
  const rejected = spyEnv({ ethereum: { request: async () => { throw { code: 4001 }; } } });
  const no = await Auth.signIn("wallet", { config: EMPTY_AUTH_CONFIG, env: rejected.env });
  eq(no.kind, "refused", "a rejected wallet request refuses");
  // The builder itself refuses an incomplete message rather than signing half of one.
  eq(buildSiweMessage({ domain: "a", address: "0x1", uri: "https://a" }), null, "an incomplete message was built anyway");
});

await check("a signed-in identity flows into Identity, is stored once, and signing out clears it", async () => {
  const { Identity } = await import("../WebXR/shared/identity.js");
  const { TrainingRecords } = await import("../WebXR/shared/records.js");
  Auth.config = parseAuthConfig({ learner_home: "https://hall.example.org" });
  const happy = spyEnv({ ethereum: { request: async (r) => (r.method === "eth_requestAccounts" ? ["0x1234567890abcdef1234567890abcdef12345678"] : "0xsig") } });
  posted.length = 0;
  await Auth.signIn("wallet", { config: Auth.config, env: happy.env });
  eq(Identity.current.id, "eip155:1:0x1234567890abcdef1234567890abcdef12345678", "Identity did not take the session");
  eq(Identity.current.provider, "wallet", "the provider travels with the identity");
  eq(Identity.current.homePage, "https://hall.example.org", "the home origin");
  eq(Identity.current.source, "auth", "the identity says where it came from");
  eq(posted.length, 1, "the host page was told exactly once");
  eq(posted[0].msg.type, "smartcitix:identity", "the message the host listens for");
  eq(posted[0].target, "https://hall.example.org", "posted to an origin other than the learner's home");
  assert(posted[0].msg.token?.signature, "the token the host must verify was not passed on");
  const keys = [...localStore.keys()];
  eq(keys.length, 1, `one versioned key, found: ${keys.join(", ")}`);
  eq(keys[0], "vr-training-auth-v1", "the key is versioned");
  // Reload: the stored session comes back and reaches Identity again.
  Identity.clear();
  eq(Auth.load()?.id, "eip155:1:0x1234567890abcdef1234567890abcdef12345678", "the session did not survive a reload");
  eq(Identity.current?.provider, "wallet", "Identity was not restored on reload");
  TrainingRecords.record({ simId: "charge-point", stars: 3, category: "Energy & Power" });
  Auth.signOut();
  eq(Auth.session, null, "the session survived sign-out");
  eq(Identity.current, null, "the identity survived sign-out");
  eq(localStore.has("vr-training-auth-v1"), false, "the stored session survived sign-out");
  eq(TrainingRecords.count(), 1, "signing out deleted records nobody asked it to delete");
  Auth.signOut({ clearRecords: true });
  eq(TrainingRecords.count(), 0, "sign-out did not clear the records when asked to");
});

console.log(failures === 0 ? "\nAll homepage and sign-in checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
