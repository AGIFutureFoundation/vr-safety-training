/**
 * Sign-in options for a static training page — honestly scoped.
 *
 * These apps are static files. There is no server here, so this module cannot
 * and does not verify anybody: what it does is collect a *credential* from a
 * provider the deployment configured, turn it into the same launch context
 * `identity.js` already understands, and hand the raw token to the host page
 * so a real back end (Cognition.X, an LMS, a union hall's portal) can verify
 * it. `docs/sign-in.md` states which half happens where, in the same words.
 *
 * Four ways in, each only offered when it is actually possible here:
 *
 *   google      Google Identity Services. Needs `googleClientId`. The ID token
 *               is decoded for a display name and subject, never verified —
 *               verification is the host's server's job.
 *   microsoft   MSAL redirect flow. Needs `microsoftClientId` and a tenant.
 *   email       A magic link: one POST to the configured `emailEndpoint`, which
 *               mails a link back to this page carrying ?learner=… . With no
 *               endpoint configured there is nothing to post to, so the option
 *               becomes a device passkey (WebAuthn) instead, labelled "this
 *               device only" because that is exactly what it is.
 *   wallet      Sign-In with Ethereum (EIP-4361): the page builds the message,
 *               the wallet signs it, the identity is the address the wallet
 *               returned. The signature is verified on the host's server.
 *
 * Configuration comes from `WebXR/auth-config.json` beside the page (same
 * origin, no third party) and may be overridden per launch with
 * `?googleClientId=`, `?microsoftClientId=`, `?microsoftTenant=`,
 * `?emailEndpoint=`, `?walletChainId=`, `?learner_home=`.
 *
 * The hard rule, which `tools/check_home.mjs` proves by driving every provider
 * against an empty configuration and counting network attempts: **nothing is
 * ever sent to an endpoint that was not configured.** With no configuration,
 * every provider refuses without touching the network.
 */

import { Identity, cleanOrigin } from "./identity.js";
import { TrainingRecords } from "./records.js";

/** One versioned key. A shape change gets a new suffix, not a migration. */
const AUTH_KEY = "vr-training-auth-v1";
/**
 * Same-origin, beside the page. The only URL this module reads unprompted — and
 * a page one directory deeper than the config (every app under WebXR/<app>/)
 * passes its own relative path through `makeAuthEnv({ configUrl })`.
 */
const AUTH_CONFIG_URL = "auth-config.json";

/**
 * A page's own configuration path, which may only ever be a relative path on
 * this origin. An absolute URL, a protocol-relative one or a root-absolute one
 * is refused and the default used instead: a launch parameter must not be able
 * to point the configuration read at somebody else's server.
 */
export function cleanConfigUrl(v) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || s.includes("//") || s.includes(":") || s.startsWith("/")) return null;
  return /^[A-Za-z0-9._/-]{1,120}$/.test(s) ? s : null;
}
const AUTH_MSG_IDENTITY = "smartcitix:identity";
const AUTH_MSG_SIGNOUT = "smartcitix:signout";

/**
 * Every absolute URL this module can ever touch, in one table, so a reader
 * (and a checker) can see the whole network surface at a glance. Each one is
 * reached only from a branch that has already found the matching configured
 * client id — there is no code path from an empty configuration to any of them.
 */
const ENDPOINTS = {
  googleScript: "https://accounts.google.com/gsi/client",
  msalScript: "https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.20.0/lib/msal-browser.min.js",
  msAuthority: "https://login.microsoftonline.com/",
};

// ------------------------------------------------------------------ cleaning

const AUTH_CONTROL_CHARS = new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`, "g");

function authText(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(AUTH_CONTROL_CHARS, "").trim().slice(0, max);
}

/** A client id as the providers actually write them: no spaces, no markup. */
export function cleanClientId(v) {
  const s = authText(v, 200);
  return /^[A-Za-z0-9._:~-]{8,200}$/.test(s) ? s : null;
}

/** A tenant id, or one of the three Microsoft keywords. */
export function cleanTenant(v) {
  const s = authText(v, 64);
  if (["common", "organizations", "consumers"].includes(s)) return s;
  return /^[A-Za-z0-9-]{4,64}$/.test(s) ? s : null;
}

/**
 * An https endpoint with no credentials in it — or null. http is allowed only
 * on localhost, which is the same rule identity.js applies to a home origin.
 */
export function cleanHttpsUrl(v) {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v.trim());
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return null;
    if (u.username || u.password) return null;
    return u.href;
  } catch (_) { return null; }
}

/** A chain id as a positive integer, or null. */
export function cleanChainId(v) {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isInteger(n) && n > 0 && n < 1e12 ? n : null;
}

/**
 * The deployment's configuration: the file's values, then the launch URL's
 * overrides. Anything that does not clean is dropped, so a malformed value
 * disables its provider rather than half-configuring it.
 */
export function parseAuthConfig(file = null, search = "") {
  let params = null;
  try { params = new URLSearchParams(search || ""); } catch (_) { params = null; }
  const pick = (key) => {
    const fromUrl = params?.get(key);
    if (fromUrl != null && fromUrl !== "") return fromUrl;
    return file?.[key];
  };
  const statement = authText(pick("walletStatement"), 200);
  return {
    googleClientId: cleanClientId(pick("googleClientId")),
    microsoftClientId: cleanClientId(pick("microsoftClientId")),
    microsoftTenant: cleanTenant(pick("microsoftTenant")),
    emailEndpoint: cleanHttpsUrl(pick("emailEndpoint")),
    walletChainId: cleanChainId(pick("walletChainId")) ?? 1,
    walletStatement: statement || null,
    // Where a signed-in identity and its token are posted, and the only origin
    // this page will ever post to (identity.js enforces that).
    homePage: cleanOrigin(pick("learner_home") ?? pick("homePage")),
  };
}

/** What a deployment that configured nothing gets. */
export const EMPTY_AUTH_CONFIG = parseAuthConfig(null, "");

// ------------------------------------------------------------------- results

/** Refused: nothing happened, and the reason is shown to the learner. */
function authRefuse(provider, reason) { return { kind: "refused", provider, reason }; }
/** Started but not finished here — a redirect, or a link in the post. */
function authPending(provider, note) { return { kind: "pending", provider, note }; }
/** Signed in: an identity, plus the raw token for the host to verify. */
function authAccept(session) { return { kind: "signed-in", provider: session.provider, session }; }

// --------------------------------------------------------------- pure pieces

/** base64url of bytes, without a dependency. */
function authB64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  const b64 = typeof btoa === "function" ? btoa(s) : Buffer.from(s, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** A 16-byte nonce as hex — EIP-4361 asks for at least eight alphanumerics. */
export function authNonce(crypto = globalThis.crypto) {
  const bytes = new Uint8Array(16);
  if (crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * A JWT's payload, decoded and NOT verified — the signature is not checked
 * here and cannot be, which is the whole reason the raw token is handed on.
 * Used only for a display name and a subject id.
 */
export function decodeJwtPayload(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const raw = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
    const json = decodeURIComponent([...raw].map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
    const claims = JSON.parse(json);
    return claims && typeof claims === "object" ? claims : null;
  } catch (_) { return null; }
}

/** 0x1234…cdef — an address short enough for a HUD. */
export function shortAddress(address) {
  const a = String(address ?? "");
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

/** A 0x-prefixed 20-byte address as the wallet returned it, or null. */
export function cleanAddress(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return /^0x[0-9a-fA-F]{40}$/.test(s) ? s : null;
}

/**
 * An EIP-4361 (Sign-In with Ethereum) message, built in the order the
 * specification fixes: the blank-line-delimited statement block is present
 * only when there is a statement, and every field appears once.
 */
export function buildSiweMessage({ domain, address, uri, statement = null, chainId = 1, nonce, issuedAt }) {
  if (!domain || !address || !uri || !nonce || !issuedAt) return null;
  const lines = [`${domain} wants you to sign in with your Ethereum account:`, address, ""];
  if (statement) lines.push(statement, "");
  lines.push(`URI: ${uri}`, "Version: 1", `Chain ID: ${chainId}`, `Nonce: ${nonce}`, `Issued At: ${issuedAt}`);
  return lines.join("\n");
}

// --------------------------------------------------------------- environment

/**
 * Everything about the browser this module touches, in one injectable object,
 * so the checker can run every provider headlessly — and so a reader can see
 * the entire outside surface in twenty lines.
 */
export function makeAuthEnv(overrides = {}) {
  const g = globalThis;
  const at = (fn, fallback) => { try { return fn() ?? fallback; } catch (_) { return fallback; } };
  return {
    href: at(() => g.location?.href, ""),
    origin: at(() => g.location?.origin, ""),
    host: at(() => g.location?.host, ""),
    search: at(() => g.location?.search, ""),
    ethereum: at(() => g.window?.ethereum ?? g.ethereum, null),
    hasPasskey: typeof g.PublicKeyCredential === "function",
    credentials: at(() => g.navigator?.credentials, null),
    crypto: at(() => g.crypto, null),
    now: () => new Date().toISOString(),
    /** Resolved fetch, or null when the page has none (headless). */
    fetch: typeof g.fetch === "function" ? (...a) => g.fetch(...a) : null,
    /** A provider SDK, loaded only from a branch that found its client id. */
    loadScript: (src) => new Promise((resolve, reject) => {
      const doc = g.document;
      if (!doc) { reject(new Error("no document")); return; }
      const already = doc.querySelector(`script[data-auth-src="${src}"]`);
      if (already) {
        if (already.dataset.authLoaded) resolve(true);
        else already.addEventListener("load", () => resolve(true));
        return;
      }
      const el = doc.createElement("script");
      el.src = src; el.async = true; el.dataset.authSrc = src;
      el.addEventListener("load", () => { el.dataset.authLoaded = "1"; resolve(true); });
      el.addEventListener("error", () => reject(new Error("the provider script did not load")));
      doc.head.appendChild(el);
    }),
    google: at(() => g.google, null),
    msal: at(() => g.msal, null),
    ...overrides,
  };
}

// ----------------------------------------------------------------- providers

async function startGoogle(ctx) {
  const { config, env } = ctx;
  if (!config.googleClientId) {
    return authRefuse("google", "This deployment has no Google client id, so there is nothing to sign in to.");
  }
  try { await env.loadScript(ENDPOINTS.googleScript); } catch (_) { /* checked on the next line */ }
  const api = (env.google ?? globalThis.google)?.accounts?.id;
  if (!api) return authRefuse("google", "The Google Identity Services script did not load in this browser.");
  const credential = await new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    try {
      api.initialize({
        client_id: config.googleClientId, auto_select: false, cancel_on_tap_outside: true,
        callback: (r) => done(typeof r?.credential === "string" ? r.credential : null),
      });
      if (ctx.mount) api.renderButton(ctx.mount, { type: "standard", theme: "filled_black", text: "signin_with", shape: "rectangular" });
      api.prompt?.((n) => { if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.() || n?.isDismissedMoment?.()) done(null); });
    } catch (_) { done(null); }
  });
  if (!credential) return authRefuse("google", "Google sign-in was dismissed.");
  const claims = decodeJwtPayload(credential);
  if (!claims?.sub) return authRefuse("google", "The Google credential carried no account id.");
  return authAccept({
    provider: "google", id: `google:${claims.sub}`,
    name: claims.name || claims.email || `google:${claims.sub}`,
    token: credential, tokenKind: "google-id-token",
    verifiedBy: "host-server", at: env.now(),
  });
}

async function startMicrosoft(ctx) {
  const { config, env } = ctx;
  if (!config.microsoftClientId || !config.microsoftTenant) {
    return authRefuse("microsoft", "This deployment has no Microsoft client id and tenant, so there is nothing to sign in to.");
  }
  try { await env.loadScript(ENDPOINTS.msalScript); } catch (_) { /* checked on the next line */ }
  const lib = env.msal ?? globalThis.msal;
  if (!lib?.PublicClientApplication) return authRefuse("microsoft", "The Microsoft sign-in library did not load in this browser.");
  let app = null;
  try {
    app = new lib.PublicClientApplication({
      auth: { clientId: config.microsoftClientId, authority: ENDPOINTS.msAuthority + config.microsoftTenant, redirectUri: env.href },
      cache: { cacheLocation: "sessionStorage" },
    });
    await app.initialize?.();
  } catch (_) { return authRefuse("microsoft", "Microsoft sign-in could not start in this browser."); }
  let result = null;
  try { result = await app.handleRedirectPromise(); } catch (_) { result = null; }
  const account = result?.account ?? app.getAllAccounts?.()?.[0] ?? null;
  if (account) {
    return authAccept({
      provider: "microsoft",
      id: `microsoft:${account.homeAccountId ?? account.localAccountId ?? account.username}`,
      name: account.name || account.username || "Microsoft account",
      token: result?.idToken ?? null, tokenKind: "microsoft-id-token",
      verifiedBy: "host-server", at: env.now(),
    });
  }
  try { await app.loginRedirect({ scopes: ["openid", "profile", "email"] }); }
  catch (_) { return authRefuse("microsoft", "Microsoft sign-in could not redirect this browser."); }
  return authPending("microsoft", "Redirecting to Microsoft. This page reopens signed in.");
}

/**
 * A passkey on this device. No endpoint, no server, no account anywhere: the
 * credential lives in this browser's authenticator and identifies this device
 * to this origin. Every label in the UI says so.
 */
async function startPasskey(ctx) {
  const { env } = ctx;
  if (!env.hasPasskey || !env.credentials) {
    return authRefuse("passkey", "No e-mail endpoint is configured and this browser has no passkey support, so there is no way to sign in here.");
  }
  const name = authText(ctx.name, 60);
  const challenge = new Uint8Array(32);
  if (env.crypto?.getRandomValues) env.crypto.getRandomValues(challenge);
  const rpId = env.host ? env.host.split(":")[0] : undefined;
  let credential = null;
  if (ctx.existing) {
    try {
      credential = await env.credentials.get({ publicKey: { challenge, rpId, userVerification: "preferred", timeout: 60000 } });
    } catch (_) { return authRefuse("passkey", "This device did not offer a passkey."); }
  } else {
    if (!name) return authRefuse("passkey", "A passkey needs a name to label it with.");
    const userId = new Uint8Array(16);
    if (env.crypto?.getRandomValues) env.crypto.getRandomValues(userId);
    try {
      credential = await env.credentials.create({
        publicKey: {
          challenge, rp: { id: rpId, name: "Training simulators" },
          user: { id: userId, name, displayName: name },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
          timeout: 60000, attestation: "none",
        },
      });
    } catch (_) { return authRefuse("passkey", "The passkey was not created — the prompt was cancelled or refused."); }
  }
  if (!credential?.rawId) return authRefuse("passkey", "This device returned no passkey.");
  return authAccept({
    provider: "passkey", id: `passkey:${authB64url(credential.rawId)}`, name: name || "This device",
    token: null, tokenKind: "none", verifiedBy: "this-device-only", at: env.now(),
  });
}

async function startEmail(ctx) {
  const { config, env } = ctx;
  const endpoint = config.emailEndpoint;
  // No endpoint means there is nowhere to post to, so nothing is posted: the
  // option becomes a device passkey instead. This is the branch the checker
  // drives to prove that an unconfigured deployment makes no request at all.
  if (!endpoint) return startPasskey(ctx);
  const email = authText(ctx.email, 200);
  if (!/^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(email)) return authRefuse("email", "That does not look like an e-mail address.");
  if (!env.fetch) return authRefuse("email", "This browser cannot send the request.");
  let res = null;
  try {
    res = await env.fetch(endpoint, {
      method: "POST", mode: "cors", credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, returnTo: env.href }),
    });
  } catch (_) { return authRefuse("email", "The sign-in service could not be reached."); }
  if (!res?.ok) return authRefuse("email", "The sign-in service refused the request.");
  return authPending("email", "Check your inbox. The link opens this page already signed in.");
}

async function startWallet(ctx) {
  const { config, env } = ctx;
  const eth = env.ethereum;
  if (!eth?.request) return authRefuse("wallet", "No Ethereum wallet is available in this browser.");
  let accounts = null;
  try { accounts = await eth.request({ method: "eth_requestAccounts" }); }
  catch (_) { return authRefuse("wallet", "The wallet refused the connection."); }
  const address = cleanAddress(Array.isArray(accounts) ? accounts[0] : null);
  if (!address) return authRefuse("wallet", "The wallet returned no account.");
  const message = buildSiweMessage({
    domain: env.host || env.origin, address, uri: env.href || env.origin,
    statement: config.walletStatement
      ?? "Sign in to the training simulators. This signature proves you control this address; it authorises nothing and spends nothing.",
    chainId: config.walletChainId ?? 1, nonce: authNonce(env.crypto), issuedAt: env.now(),
  });
  if (!message) return authRefuse("wallet", "This page could not build a sign-in message.");
  let signature = null;
  try { signature = await eth.request({ method: "personal_sign", params: [message, address] }); }
  catch (_) { return authRefuse("wallet", "The wallet declined to sign."); }
  if (typeof signature !== "string" || !signature) return authRefuse("wallet", "The wallet returned no signature.");
  return authAccept({
    provider: "wallet", id: `eip155:${config.walletChainId ?? 1}:${address}`,
    name: shortAddress(address), address,
    token: { message, signature }, tokenKind: "eip4361",
    verifiedBy: "host-server", at: env.now(),
  });
}

/**
 * The registry. `configured` asks whether this deployment set the option up;
 * `possible` asks whether this browser could do it at all. The dialog lists
 * only the options where both are true, so nothing is offered that cannot
 * work — and each entry carries, in one sentence, where verification happens.
 */
export const PROVIDERS = [
  {
    id: "google", label: "Continue with Google", short: "Google",
    note: "Google returns a signed ID token. This page reads your name out of it; your training host verifies the signature.",
    verifies: "host-server",
    configured: (cfg) => !!cfg.googleClientId,
    possible: () => true,
    start: startGoogle,
  },
  {
    id: "microsoft", label: "Continue with Microsoft", short: "Microsoft",
    note: "Your organisation's Microsoft sign-in, by redirect. This page reads your name out of the token; your training host verifies it.",
    verifies: "host-server",
    configured: (cfg) => !!cfg.microsoftClientId && !!cfg.microsoftTenant,
    possible: () => true,
    start: startMicrosoft,
  },
  {
    id: "email", label: "E-mail me a sign-in link", short: "E-mail link",
    note: "One request to your training provider's link service. It mails a link that opens this page signed in.",
    verifies: "host-server",
    configured: (cfg) => !!cfg.emailEndpoint,
    possible: () => true,
    start: startEmail,
    needs: "email",
  },
  {
    id: "passkey", label: "Use a passkey on this device", short: "Passkey",
    note: "This device only. No account is created anywhere and nothing is sent; the passkey identifies this browser on this site so your records carry a name.",
    verifies: "this-device-only",
    // Offered exactly when the e-mail link is not configured: it is that
    // option's fallback, not a fifth way in.
    configured: (cfg) => !cfg.emailEndpoint,
    possible: (env) => !!env.hasPasskey && !!env.credentials,
    start: startPasskey,
    needs: "name",
  },
  {
    id: "wallet", label: "Sign in with Ethereum", short: "Wallet",
    note: "Your wallet signs an EIP-4361 message and the address becomes your learner id. Signature verification happens on your training host's server, not in this page.",
    verifies: "host-server",
    configured: () => true,
    possible: (env) => !!env.ethereum?.request,
    start: startWallet,
  },
];

/** The options to offer here: configured by this deployment, possible in this browser. */
export function availableProviders(config = EMPTY_AUTH_CONFIG, env = makeAuthEnv()) {
  return PROVIDERS.filter((p) => p.configured(config) && p.possible(env));
}

/** A provider by id, or null. */
export function providerById(id) { return PROVIDERS.find((p) => p.id === id) ?? null; }

// ------------------------------------------------------------------- session

function cleanSession(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = authText(raw.id, 200);
  const name = authText(raw.name, 60);
  const provider = typeof raw.provider === "string" && /^[a-z]{3,20}$/.test(raw.provider) ? raw.provider : null;
  if (!id || !provider) return null;
  return {
    provider, id, name: name || id,
    address: cleanAddress(raw.address),
    tokenKind: typeof raw.tokenKind === "string" ? raw.tokenKind.slice(0, 40) : "none",
    verifiedBy: raw.verifiedBy === "this-device-only" ? "this-device-only" : "host-server",
    at: typeof raw.at === "string" ? raw.at.slice(0, 40) : null,
    token: raw.token ?? null,
  };
}

export const Auth = {
  /** The deployment's configuration, once loaded. */
  config: EMPTY_AUTH_CONFIG,
  /** The signed-in session, or null. */
  session: null,
  env: null,

  /**
   * Read `auth-config.json` beside the page, then apply the launch URL's
   * overrides. The file is same-origin and optional: a deployment that
   * configures nothing simply gets the passkey and wallet options.
   */
  async loadConfig(env = makeAuthEnv()) {
    this.env = env;
    let file = null;
    const configUrl = cleanConfigUrl(env.configUrl) ?? AUTH_CONFIG_URL;
    if (env.fetch) {
      try {
        const res = await env.fetch(configUrl, { cache: "no-cache" });
        if (res?.ok) file = await res.json();
      } catch (_) { file = null; }
    }
    this.config = parseAuthConfig(file && typeof file === "object" ? file : null, env.search);
    return this.config;
  },

  /** The stored session, pushed into Identity so every app sees the learner. */
  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (_) { saved = null; }
    const session = cleanSession(saved);
    this.session = session;
    if (session) this.adopt(session, { store: false });
    return session;
  },

  /**
   * Make a session the current identity: stored under the one versioned key,
   * handed to Identity exactly like a launch-URL identity, and posted to the
   * host page (origin-bound, by identity.js) together with the raw token, so a
   * real back end can verify what this page cannot.
   */
  adopt(raw, { store = true } = {}) {
    const session = cleanSession(raw);
    if (!session) return null;
    this.session = session;
    if (store) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(session)); } catch (_) { /* private mode */ } }
    Identity.set({
      name: session.name, id: session.id,
      homePage: this.config?.homePage ?? null,
      source: "auth", provider: session.provider,
    });
    Identity.emit(AUTH_MSG_IDENTITY, {
      learner: session.name, learner_id: session.id, learner_home: this.config?.homePage ?? null,
      provider: session.provider, token: session.token, tokenKind: session.tokenKind,
      verifiedBy: session.verifiedBy,
    });
    return session;
  },

  /** Run one option. Never throws; always returns a result with a reason. */
  async signIn(providerId, opts = {}) {
    const provider = providerById(providerId);
    if (!provider) return authRefuse(String(providerId), "Unknown sign-in option.");
    const env = opts.env ?? this.env ?? makeAuthEnv();
    this.env = env;
    const config = opts.config ?? this.config ?? EMPTY_AUTH_CONFIG;
    if (!provider.configured(config)) return authRefuse(provider.id, `This deployment has not configured ${provider.short}.`);
    if (!provider.possible(env)) return authRefuse(provider.id, `${provider.short} is not available in this browser.`);
    let result;
    try { result = await provider.start({ ...opts, config, env }); }
    catch (_) { return authRefuse(provider.id, `${provider.short} sign-in failed in this browser.`); }
    if (result?.kind === "signed-in") this.adopt(result.session);
    return result;
  },

  /**
   * Sign out. Clears the identity always; clears this browser's training
   * records only when the learner asked for that, because the records are
   * theirs and leaving a kiosk is not the same as discarding them.
   */
  signOut({ clearRecords = false } = {}) {
    Identity.emit(AUTH_MSG_SIGNOUT, { provider: this.session?.provider ?? null });
    this.session = null;
    try { localStorage.removeItem(AUTH_KEY); } catch (_) { /* ignore */ }
    Identity.clear();
    if (clearRecords) TrainingRecords.clear();
    return true;
  },

  /** The one line a HUD shows: who is signed in, and how far that goes. */
  describe() {
    if (!this.session) return null;
    const s = this.session;
    const where = s.verifiedBy === "this-device-only"
      ? "this device only — nothing was sent anywhere"
      : "verified by your training host, not by this page";
    return `${s.name} · ${providerById(s.provider)?.short ?? s.provider} · ${where}`;
  },
};
