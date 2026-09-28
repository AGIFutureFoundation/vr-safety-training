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
  // The page's own <img> tags are the world captures; the fixture must add none.
  eq((dirty.match(/<img/g) ?? []).length, (home.match(/<img/g) ?? []).length, "the hostile name produced a real <img> tag — <img> tags in the page");
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

await check("auth.js is in every bundle, because every bundle carries the account chip", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const apps = (bundler.match(/"modules": \[/g) ?? []).length;
  eq((bundler.match(/SHARED \/ "auth\.js"/g) ?? []).length, apps, "auth.js entries in the bundler's module lists");
  eq((bundler.match(/SHARED \/ "account\.js"/g) ?? []).length, apps, "account.js entries in the bundler's module lists");
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
  // Records are private to the identity (shared/profiles.js): signing out
  // hides them, signing back in shows them again — nothing was deleted.
  eq(TrainingRecords.count(), 0, "signing out left the signed-in person's records on show");
  await Auth.signIn("wallet", { config: Auth.config, env: happy.env });
  eq(TrainingRecords.count(), 1, "signing out deleted records nobody asked it to delete");
  Auth.signOut({ clearRecords: true });
  await Auth.signIn("wallet", { config: Auth.config, env: happy.env });
  eq(TrainingRecords.count(), 0, "sign-out did not clear the records when asked to");
  Auth.signOut();
});

// ------------------------------------------- 4. the front door (console MARQUEE)

const HM_WORLDS = ["bayworld", "regatta", "underwater", "summit", "parishes", "fairway", "redwood", "atlas", "smartcity", "holodeck"];

await check("the hero carries a recorded loop, one headline and the two actions", () => {
  for (const [file, html, layout] of [["index.html", home, { go: "bayworld/index.html" }], ["home.html", flat, { go: "bayworld.html" }]]) {
    assert(/<section class="hero" id="hero"[^>]*>\s*<div class="cn-bg" aria-hidden="true"[^>]*><video data-cn-slot="hero" autoplay muted loop playsinline preload="metadata"/.test(html), `${file}: the hero has no decorative background loop`);
    eq((html.match(/<h1\b/g) ?? []).length, 1, `${file}: headlines on the page`);
    assert(html.includes(`<a class="hm-act go" id="hm-start" href="${layout.go}">`) && />Start playing<\/a>/.test(html), `${file}: no "Start playing" action into Bay World`);
    assert(html.includes('<a class="hm-act alt" id="hm-find" href="#finder">') && />Find your trade<\/a>/.test(html), `${file}: no "Find your trade" action into the finder`);
  }
  // Nothing from another origin: the loop and its poster are files beside the page.
  const hero = /<section class="hero"[\s\S]*?<\/section>/.exec(home)[0];
  assert(!/https?:/.test(hero), "the hero reaches for a network resource");
});

await check("reduced motion or Save-Data gets the poster only, and the loops pause off-screen", () => {
  const src = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  const cn = readFileSync(join(WEBXR, "shared", "cinema.js"), "utf8");
  assert(home.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'), "the hero never asks for prefers-reduced-motion");
  assert(/navigator\.connection && navigator\.connection\.saveData/.test(home) && /navigator\.connection && navigator\.connection\.saveData/.test(cn), "Save-Data is never asked for");
  assert(/@media \(prefers-reduced-motion: reduce\)\{\.cn-bg video\{display:none\}/.test(home), "the page's stylesheet does not hide the loops under reduced motion before any script runs");
  assert(/IntersectionObserver/.test(cn) && /document\.hidden/.test(cn) && /document\.hidden/.test(home), "the loops keep playing off-screen or in a hidden tab");
  assert(/@media \(prefers-reduced-motion:reduce\)/.test(src), "the stylesheet has no reduced-motion rule");
});

await check("eight world cards, each with a real capture inlined at no more than 60 KB", () => {
  for (const [file, html] of [["index.html", home], ["home.html", flat]]) {
    const grid = /<div class="worlds" id="worlds">([\s\S]*?)\n {4}<\/div>/.exec(html);
    assert(grid, `${file}: no world grid`);
    const imgs = [...grid[1].matchAll(/<img src="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)" alt="In-game view of ([^"]+)"/g)];
    eq(imgs.length, HM_WORLDS.length, `${file}: world cards with an inlined capture`);
    for (const m of imgs) assert(Buffer.from(m[1], "base64").length <= 60 * 1024, `${file}: the ${m[2]} capture is over 60 KB`);
  }
  for (const id of HM_WORLDS) {
    const f = join(WEBXR, "home", "img", `${id}.jpg`);
    assert(existsSync(f), `WebXR/home/img/${id}.jpg is missing — run node tools/capture_home_thumbs.mjs`);
    const b = readFileSync(f);
    assert(b[0] === 0xff && b[1] === 0xd8, `WebXR/home/img/${id}.jpg is not a JPEG`);
  }
});

await check("the programme finder: a card per programme with its union, station count, chip and one Start", () => {
  const finder = /<section class="finder hm-sec" id="finder"[\s\S]*?<\/section>/.exec(home);
  assert(finder, "no programme finder");
  for (const id of ["hm-find-q", "hm-find-union", "hm-find-cat", "hm-find-world"]) assert(finder[0].includes(`id="${id}"`), `the finder has no #${id} filter`);
  const cards = finder[0].match(/<article class="prog"[\s\S]*?<\/article>/g) ?? [];
  eq(cards.length, catalog.curricula.length, "programme cards in the finder");
  catalog.curricula.forEach((c, i) => {
    const card = cards[i];
    assert(card.includes(`style="--tint:${String(c.accent).toLowerCase()}"`), `${c.id}: the card does not carry the programme's colour`);
    assert(card.includes(`<p class="prog-union">${escapeForHtml(c.union)}</p>`), `${c.id}: no union line`);
    assert(card.includes(`>${c.stations.length} station`), `${c.id}: no station count`);
    assert(card.includes(`data-pp-programme="${c.id}"`), `${c.id}: no progress chip`);
    eq((card.match(/<a /g) ?? []).length, 1, `${c.id}: actions on the card`);
    assert(card.includes(`?programme=${c.id}">Start<`), `${c.id}: the one action is not Start`);
  });
  assert(/pp\.ppProgressChip\(el, el\.getAttribute\("data-pp-programme"\)\)/.test(home), "the finder's chips are never filled from the passport");
  const unions = gen.hmUnionTokens(catalog.curricula);
  assert(unions.length >= 8, `only ${unions.length} union filters`);
  for (const u of unions) assert(home.includes(`>${escapeForHtml(u.token)}<small>${u.count}</small></button>`), `the unions strip has no ${u.token}`);
});

await check("the continue strip is on the page with a first-visit state, and how it works is four steps", () => {
  const cont = /<section class="continue hm-sec" id="continue"[^>]*>([\s\S]*?)<\/section>/.exec(home);
  assert(cont && !/id="continue"[^>]*hidden/.test(home), "the continue strip is missing or hidden");
  assert(/Continue where you left off/.test(cont[1]) && /first visit/.test(cont[1]), "the continue strip has no first-visit state");
  assert(/<a class="btn primary" id="continue-link" href="bayworld\/index\.html">Start in Bay World<\/a>/.test(cont[1]), "the empty state offers no way in");
  assert(!/smartcity\/index\.html\?sim=/.test(/const HM_LINKS[^\n]*/.exec(flat)?.[0] ?? ""), "the flat page resumes into the repository layout");
  const steps = /<ol class="hm-steps">([\s\S]*?)<\/ol>/.exec(home);
  assert(steps, "no how-it-works strip");
  eq([...steps[1].matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1]).join(" → "), "Play → Take a job → Pass the procedure → Earn the credential", "the how-it-works steps");
  // Mobile-first order: hero, continue, how it works, worlds, finder, unions, then the roster.
  const order = ['id="hero"', 'id="continue"', 'id="how"', 'id="worlds"', 'id="finder"', 'id="unions"', 'id="tracks"', 'id="catalog"'].map((k) => home.indexOf(k));
  assert(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), `the sections are out of order: ${order.join(", ")}`);
});

// ------------------------------------- 4b. background loops (console CINEMA)

const CN_MEDIA = join(WEBXR, "home", "media");
const CN_SLOTS = JSON.parse(readFileSync(join(CN_MEDIA, "backgrounds.json"), "utf8")).slots;
const CN_BUDGET = (slot) => (slot === "hero" ? 2.5 : 1.2) * 1024 * 1024;

await check("background loops: every slot's files exist, are H.264 MP4 with no audio and faststart, and fit the budget", () => {
  const ids = new Set();
  for (const e of CN_SLOTS) {
    assert(/^[a-z0-9-]+$/.test(e.slot) && !ids.has(e.slot), `slot ${e.slot}: not a plain, unique id`);
    ids.add(e.slot);
    assert(["in-game", "licensed"].includes(e.kind), `slot ${e.slot}: kind is ${e.kind}`);
    assert(e.credit && e.licence, `slot ${e.slot}: no credit or licence`);
    for (const k of ["src", "poster"]) assert(/^[a-z0-9][a-z0-9._-]*\.(mp4|jpg)$/.test(e[k] ?? "") && existsSync(join(CN_MEDIA, e[k])), `slot ${e.slot}: ${k} ${e[k]} missing from WebXR/home/media`);
    const mp4 = readFileSync(join(CN_MEDIA, e.src));
    assert(mp4.length <= CN_BUDGET(e.slot), `slot ${e.slot}: ${e.src} is ${(mp4.length / 1048576).toFixed(2)} MB, over ${(CN_BUDGET(e.slot) / 1048576).toFixed(1)} MB`);
    eq(mp4.toString("latin1", 4, 8), "ftyp", `${e.src}: not an MP4`);
    const moov = mp4.indexOf("moov"), mdat = mp4.indexOf("mdat");
    assert(moov > 0 && moov < mdat, `${e.src}: the index is not at the front (encode with -movflags +faststart)`);
    assert(mp4.includes("avc1"), `${e.src}: not H.264`);
    assert(!mp4.includes("soun"), `${e.src}: carries an audio track`);
    if (e.webm) {
      assert(/^[a-z0-9][a-z0-9._-]*\.webm$/.test(e.webm) && existsSync(join(CN_MEDIA, e.webm)), `slot ${e.slot}: webm ${e.webm} missing`);
      const webm = readFileSync(join(CN_MEDIA, e.webm));
      assert(webm.readUInt32BE(0) === 0x1a45dfa3 && webm.length <= CN_BUDGET(e.slot), `slot ${e.slot}: ${e.webm} is not a WebM within the budget`);
    }
    const jpg = readFileSync(join(CN_MEDIA, e.poster));
    assert(jpg[0] === 0xff && jpg[1] === 0xd8 && jpg.length <= 200 * 1024, `${e.poster}: not a JPEG under 200 KB`);
  }
  for (const want of ["hero", "bayworld", "underwater", "regatta", "fairway", "start-bayworld", "start-underwater", "start-regatta", "start-fairway", "track-bayworld", "track-underwater", "track-default", "atlas-header", "signin", "holodeck-landing"]) {
    assert(ids.has(want), `backgrounds.json has no ${want} slot`);
  }
  assert(existsSync(join(ROOT, "docs", "home-backgrounds.md")), "docs/home-backgrounds.md is missing");
});

await check("the homepage's videos are muted, inline, looped, with posters on disk; only the hero autoplays", () => {
  for (const [file, html, dir] of [["index.html", home, WEBXR], ["home.html", flat, join(WEBXR, "dist")]]) {
    const vids = [...html.matchAll(/<video ([^>]*)>([\s\S]*?)<\/video>/g)];
    eq(vids.length, 5, `${file}: background videos (hero and four world cards)`);
    for (const [, attrs, inner] of vids) {
      const slot = /data-cn-slot="([a-z0-9-]+)"/.exec(attrs)?.[1];
      assert(slot && CN_SLOTS.some((e) => e.slot === slot), `${file}: a video with no listed slot`);
      for (const a of [" muted", " loop", " playsinline", ' preload="metadata"', ' aria-hidden="true"']) assert(attrs.includes(a), `${file} ${slot}: no${a}`);
      eq(attrs.includes(" autoplay"), slot === "hero", `${file} ${slot}: autoplay only on the hero`);
      const poster = /poster="([^"]+)"/.exec(attrs)?.[1];
      assert(poster && !/^https?:/.test(poster), `${file} ${slot}: no local poster`);
      if (file === "index.html") assert(existsSync(resolve(dir, poster)), `${file} ${slot}: poster ${poster} does not resolve`);
      assert(/<source src="[^"]+\.mp4" type="video\/mp4">/.test(inner), `${file} ${slot}: no MP4 source`);
      assert(!inner.includes("webm") || /^<source src="[^"]+\.webm" type="video\/webm">/.test(inner), `${file} ${slot}: the WebM source is not first`);
    }
    assert(/<button class="cn-toggle" type="button" data-cn-toggle="hero" aria-pressed="false">Pause background<\/button>/.test(html), `${file}: the hero has no pause button`);
  }
});

await check("the other surfaces mount their slots: world start screens, Atlas header, Holodeck landing, sign-in, track bands", () => {
  const uses = [
    ["bayworld/js/app.js", "start-bayworld"], ["underwater/js/app.js", "start-underwater"], ["regatta/js/app.js", "start-regatta"], ["fairway/js/app.js", "start-fairway"],
    ["bayworld/js/atlas.js", "atlas-header"], ["holodeck/js/app.js", "holodeck-landing"], ["shared/account.js", "signin"],
  ];
  for (const [f, slot] of uses) {
    const src = readFileSync(join(WEBXR, f), "utf8");
    assert(/import \{ cnMount \} from "\.{1,2}\/(?:\.\.\/shared\/)?cinema\.js";/.test(src), `${f}: does not import cnMount from shared/cinema.js`);
    assert(src.includes(`"${slot}"`), `${f}: does not mount the ${slot} slot`);
  }
  const tracks = join(WEBXR, "home", "tracks");
  const tg = readFileSync(join(ROOT, "tools", "gen_tracks.mjs"), "utf8");
  assert(/trackVideo\(prog\.id\)/.test(tg), "gen_tracks.mjs does not write the header band loop");
  let n = 0;
  for (const c of catalog.curricula) {
    const f = join(tracks, `${c.id}.html`);
    if (!existsSync(f)) continue;
    const html = readFileSync(f, "utf8");
    const m = /<section class="hero cn-band">\s*<div class="cn-bg"[^>]*><video data-cn-slot="(track-[a-z]+)" muted loop playsinline preload="metadata" poster="\.\.\/media\/([^"]+)"/.exec(html);
    assert(m, `${c.id}: the track page has no header band loop`);
    assert(existsSync(join(CN_MEDIA, m[2])), `${c.id}: poster ${m[2]} missing`);
    assert(html.includes('import { cnEnhanceAll } from "../shared/cinema.js"'), `${c.id}: the band loop is never wired`);
    n += 1;
  }
  assert(n === catalog.curricula.length, `${n} of ${catalog.curricula.length} track pages carry a band loop`);
  const dist = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  assert(dist.includes('"cinema.js"') && /WEBXR \/ "home" \/ "media"/.test(dist), "the bundler does not ship cinema.js and the media folder");
  for (const e of CN_SLOTS) for (const k of ["src", "webm", "poster"]) if (e[k]) assert(existsSync(join(WEBXR, "dist", "media", e[k])), `WebXR/dist/media/${e[k]} missing — run python3 tools/bundle_webxr.py`);
});

// Headless: the flat page as it ships (WebXR/dist/index.html), at a 360 px
// phone and a 1280 px desktop, animated and with reduced motion.
await check("in a browser: no overlap, no sideways scroll, readable text, a live and a still hero, a working finder", async () => {
  const { createServer } = await import("node:http");
  const { statSync, mkdirSync } = await import("node:fs");
  const { extname, normalize } = await import("node:path");
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".jpg": "image/jpeg" };
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
    const { chromium } = await import(PW);
    browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
  } catch (e) { server.close(); throw new Error(`could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`); }
  const problems = [];
  try {
    for (const size of [{ w: 360, h: 640, phone: true }, { w: 1280, h: 720, phone: false }]) {
      for (const motion of ["no-preference", "reduce"]) {
        const tag = `${size.w}px ${motion}`;
        const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, hasTouch: size.phone, isMobile: size.phone, reducedMotion: motion });
        await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
        await page.goto(`${base}/dist/index.html`, { waitUntil: "load", timeout: 30000 });
        await page.waitForTimeout(700);
        const m = await page.evaluate(() => {
          const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; };
          const secs = ["#hero", "#continue", "#how", "#worlds-sec", "#finder", "#unions", "#tracks", "#catalog"].map((s) => ({ s, el: document.querySelector(s) }));
          const act = [...document.querySelectorAll(".hm-act")].map(box);
          const small = [];
          for (const el of document.querySelectorAll(".hero-lead, .hm-steps span, .app.world p, .prog-union, .prog-meta, .cont-line, .hm-sub, .hm-filters input, .hm-filters select, .hm-act, .prog-go")) {
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (fs < 15) small.push(`${el.className}:${fs}`);
          }
          const imgs = [...document.querySelectorAll("#worlds img")];
          return {
            hero: document.documentElement.dataset.hmHero, sideways: document.documentElement.scrollWidth - innerWidth,
            secs: secs.map(({ s, el }) => el ? { s, ...box(el) } : { s, missing: true }), act,
            actTargets: act.map((b) => b.h), small, imgsOk: imgs.length && imgs.every((i) => i.complete && i.naturalWidth > 0), imgs: imgs.length,
            heroInView: act.every((b) => b.y + b.h <= innerHeight + 1),
            guideCorner: [...document.querySelectorAll("body *")].filter((el) => { const cs = getComputedStyle(el); if (cs.position !== "fixed" || el.closest("[hidden]") || cs.display === "none") return false; if (el.closest("#gd-btn, #gd-panel")) return false; /* the corner is reserved for the Guide itself */ const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth - 84 && r.bottom > innerHeight - 84; }).map((el) => el.id || el.className),
          };
        });
        if (process.env.HM_SHOTS && motion === "no-preference") {
          mkdirSync(process.env.HM_SHOTS, { recursive: true });
          await page.screenshot({ path: join(process.env.HM_SHOTS, `homepage-${size.w}.png`), fullPage: false });
        }
        if (m.hero !== (motion === "reduce" ? "still" : "live")) problems.push(`${tag}: the hero is ${m.hero}`);
        if (m.sideways > 1) problems.push(`${tag}: the page scrolls sideways by ${m.sideways}px`);
        for (const s of m.secs) if (s.missing) problems.push(`${tag}: ${s.s} missing`);
        const secs = m.secs.filter((s) => !s.missing);
        for (let i = 1; i < secs.length; i++) if (secs[i].y < secs[i - 1].y + secs[i - 1].h - 0.5) problems.push(`${tag}: ${secs[i].s} overlaps ${secs[i - 1].s}`);
        if (m.act.length !== 2) problems.push(`${tag}: ${m.act.length} hero actions`);
        else {
          const [a, b] = m.act;
          if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${tag}: the two actions overlap`);
          if (m.actTargets.some((h) => h < 48)) problems.push(`${tag}: a hero action is under 48 px tall`);
        }
        if (!m.heroInView) problems.push(`${tag}: the two actions are not both on the first screen`);
        if (m.small.length) problems.push(`${tag}: text under 15 px: ${m.small.slice(0, 4).join(", ")}`);
        if (!m.imgsOk) problems.push(`${tag}: ${m.imgs} world images, not all decoded`);
        if (m.guideCorner.length) problems.push(`${tag}: something fixed sits in the Guide's bottom-right corner: ${m.guideCorner.join(", ")}`);
        if (motion === "no-preference" && !size.phone) {
          const before = await page.evaluate(() => document.getElementById("hm-find-count").textContent);
          await page.fill("#hm-find-q", "IBEW");
          const after = await page.evaluate(() => ({ text: document.getElementById("hm-find-count").textContent, shown: document.querySelectorAll("#hm-progs .prog:not([hidden])").length }));
          if (before === after.text || !/programmes match/.test(after.text) || after.shown < 1) problems.push(`${tag}: typing IBEW does not filter the finder (${after.text})`);
          await page.fill("#hm-find-q", "");
          await page.selectOption("#hm-find-world", "deep");
          const deep = await page.evaluate(() => document.getElementById("hm-find-count").textContent);
          if (!/programmes match/.test(deep)) problems.push(`${tag}: the world filter does nothing (${deep})`);
          await page.click(".hm-union");
          const pressed = await page.evaluate(() => document.querySelector(".hm-union").getAttribute("aria-pressed"));
          if (pressed !== "true") problems.push(`${tag}: a union chip does not set the finder's union`);
        }
        const chips = await page.evaluate(() => document.querySelectorAll("#hm-progs .pp-chip:not([hidden])").length);
        if (chips !== catalog_len()) problems.push(`${tag}: ${chips} progress chips filled`);
        if (errors.length) problems.push(`${tag}: page error ${errors.slice(0, 2).join(" | ")}`);
        await context.close();
      }
    }
    // A returning learner: seed a last run (from a Bay World board) and a
    // trades bench run, and the continue strip's links must resolve to real
    // files in both layouts — the repository page and the flat dist copy.
    const city = catalog.stations.find((s) => s.app === "smartcity");
    const bench = catalog.stations.find((s) => s.app === "trades");
    for (const [label, pagePath, dir] of [["repo", "/index.html", WEBXR], ["flat", "/dist/index.html", join(WEBXR, "dist")]]) {
      for (const station of [city, bench]) {
        const context = await browser.newContext({ viewport: { width: 360, height: 640 } });
        await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const rec = [{ app: station.app, simId: station.id, simName: station.name, at: new Date().toISOString(), passed: true, stars: 2, source: "bayworld" }];
        await context.addInitScript((r) => { try { localStorage.setItem("vr-training-records-v1", r); } catch { /* private */ } }, JSON.stringify(rec));
        const page = await context.newPage();
        await page.goto(`${base}${pagePath}`, { waitUntil: "load", timeout: 30000 });
        await page.waitForTimeout(400);
        const got = await page.evaluate(() => ({
          state: document.getElementById("continue").dataset.state,
          resume: document.getElementById("continue-link").getAttribute("href"),
          back: document.getElementById("hm-cont-world").hidden ? null : document.getElementById("hm-cont-world").getAttribute("href"),
          line: document.getElementById("continue-line").textContent,
        }));
        if (got.state !== "returning") problems.push(`${label} ${station.app}: the continue strip did not switch to the returning state`);
        if (!got.line.includes(station.name)) problems.push(`${label} ${station.app}: the continue line does not name ${station.id}`);
        for (const href of [got.resume, got.back]) {
          if (!href) { problems.push(`${label} ${station.app}: a continue link is missing`); continue; }
          if (!existsSync(resolve(dir, href.split(/[?#]/)[0]))) problems.push(`${label} ${station.app}: the continue link ${href} does not resolve to a file`);
        }
        const want = label === "flat" ? (station.app === "trades" ? "trade-skills-simulator.html?room=" : "smartcity-x.html?sim=") : (station.app === "trades" ? "trades/index.html?room=" : "smartcity/index.html?sim=");
        if (got.resume !== `${want}${station.id}`) problems.push(`${label} ${station.app}: resume link is ${got.resume}, want ${want}${station.id}`);
        await context.close();
      }
    }
  } finally { await browser.close(); server.close(); }
  function catalog_len() { return catalog.curricula.length; }
  assert(problems.length === 0, problems.slice(0, 8).join("\n      "));
});

// Headless: the loops as they ship (WebXR/dist/index.html and one track page).
await check("in a browser: the hero loop plays and its button pauses it, cards wait until on screen, reduced motion shows posters, 360 px stays in bounds", async () => {
  const { createServer } = await import("node:http");
  const { statSync } = await import("node:fs");
  const { extname, normalize } = await import("node:path");
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".webm": "video/webm" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const { chromium } = await import(PW);
  const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  const problems = [];
  try {
    for (const motion of ["no-preference", "reduce"]) {
      for (const size of [{ w: 1280, h: 720 }, { w: 360, h: 640, phone: true }]) {
        const tag = `${size.w}px ${motion}`;
        const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, isMobile: !!size.phone, hasTouch: !!size.phone, reducedMotion: motion });
        await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const page = await context.newPage();
        await page.goto(`${base}/dist/index.html`, { waitUntil: "load", timeout: 30000 });
        await page.waitForTimeout(1500);
        const m = await page.evaluate(() => {
          const hero = document.querySelector('video[data-cn-slot="hero"]');
          const cards = [...document.querySelectorAll("#worlds video[data-cn-slot]")];
          const layers = [...document.querySelectorAll("#hero .cn-bg, #worlds .cn-bg")];
          return {
            sideways: document.documentElement.scrollWidth - innerWidth,
            heroPlaying: !!hero && !hero.paused && hero.currentTime > 0,
            heroShown: !!hero && getComputedStyle(hero).display !== "none",
            cardsShown: cards.filter((v) => getComputedStyle(v).display !== "none").length,
            offscreenPlaying: cards.filter((v) => v.getBoundingClientRect().top > innerHeight && !v.paused).length,
            posters: layers.filter((l) => /\.jpg/.test(getComputedStyle(l).backgroundImage)).length, layers: layers.length,
            toggle: (() => { const t = document.querySelector('[data-cn-toggle="hero"]'); return t && getComputedStyle(t).display !== "none" && !t.hidden; })(),
          };
        });
        if (m.sideways > 1) problems.push(`${tag}: the page scrolls sideways by ${m.sideways}px`);
        if (m.posters !== m.layers || m.layers !== 5) problems.push(`${tag}: ${m.posters} of ${m.layers} background layers show a poster`);
        if (motion === "reduce") {
          if (m.heroShown || m.cardsShown) problems.push(`${tag}: a loop is visible under reduced motion`);
          if (m.heroPlaying) problems.push(`${tag}: the hero plays under reduced motion`);
          if (m.toggle) problems.push(`${tag}: the pause button shows with no loop to pause`);
        } else {
          if (!m.heroPlaying) problems.push(`${tag}: the hero loop is not playing`);
          if (m.offscreenPlaying) problems.push(`${tag}: ${m.offscreenPlaying} off-screen card loops are playing`);
          if (!m.toggle) problems.push(`${tag}: no pause button`);
          else {
            await page.click('[data-cn-toggle="hero"]');
            const off = await page.evaluate(() => ({ pressed: document.querySelector('[data-cn-toggle="hero"]').getAttribute("aria-pressed"), paused: document.querySelector('video[data-cn-slot="hero"]').paused }));
            if (off.pressed !== "true" || !off.paused) problems.push(`${tag}: the pause button does not pause the hero (${JSON.stringify(off)})`);
            await page.click('[data-cn-toggle="hero"]');
            await page.waitForTimeout(300);
            const on = await page.evaluate(() => ({ pressed: document.querySelector('[data-cn-toggle="hero"]').getAttribute("aria-pressed"), paused: document.querySelector('video[data-cn-slot="hero"]').paused }));
            if (on.pressed !== "false" || on.paused) problems.push(`${tag}: the button does not resume the hero (${JSON.stringify(on)})`);
          }
          if (!size.phone) {
            await page.evaluate(() => document.getElementById("worlds").scrollIntoView());
            await page.waitForTimeout(1200);
            const playing = await page.evaluate(() => [...document.querySelectorAll("#worlds video[data-cn-slot]")].filter((v) => !v.paused).length);
            if (playing < 1) problems.push(`${tag}: no card loop plays once the cards are on screen`);
            const heroPaused = await page.evaluate(() => document.querySelector('video[data-cn-slot="hero"]').paused);
            if (!heroPaused) problems.push(`${tag}: the hero keeps playing when scrolled away`);
          }
        }
        await context.close();
      }
    }
    // A track page's header band.
    const context = await browser.newContext({ viewport: { width: 360, height: 640 } });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const page = await context.newPage();
    await page.goto(`${base}/dist/tracks/${catalog.curricula[0].id}.html`, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1200);
    const t = await page.evaluate(() => { const v = document.querySelector(".cn-band video[data-cn-slot]"); return { v: !!v, playing: !!v && !v.paused, sideways: Math.round(document.querySelector(".cn-band").getBoundingClientRect().right - innerWidth) }; });
    if (!t.v || !t.playing) problems.push(`track page: the band loop is ${t.v ? "not playing" : "missing"}`);
    if (t.sideways > 1) problems.push(`track page: the header band overflows by ${t.sideways}px`);
    await context.close();
  } finally { await browser.close(); server.close(); }
  assert(problems.length === 0, problems.slice(0, 8).join("\n      "));
});

console.log(failures === 0 ? "\nAll homepage and sign-in checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
