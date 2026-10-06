// Live Learning Record Store connection — the step after exporting xAPI as
// a file. When an LRS endpoint is configured, every finished attempt is
// queued as an xAPI statement and POSTed to `<endpoint>/statements`; the
// queue lives in localStorage so a statement that fails to send (offline
// kiosk, LRS down) is retried on the next attempt, the next page load or a
// manual "send now" — nothing is lost and nothing is sent twice, because
// every statement carries the record's own id and an LRS de-duplicates on
// statement id.
//
// Configuration arrives three ways, all under the deployer's control:
//   1. A form on the Training Records overlay (endpoint + credential),
//      kept per tab in sessionStorage — a credential is never written to
//      localStorage, so it does not outlive the tab.
//   2. The embedding page, via postMessage({ type: "smartcitix:lrs",
//      endpoint, auth }) — accepted only from the learner's home origin
//      (see identity.js), so a stray frame cannot redirect records.
//   3. The launch URL's `lrs_endpoint` param — endpoint only, never a
//      credential, for LRSs that accept unauthenticated statements from a
//      kiosk network. Scrubbed from the address bar like the identity params.
//
// Nothing is queued while unconfigured: an LRS added later gets the local
// history through "Send all", not silently.

import { toXAPI } from "./records.js";

const LRS_CONFIG_KEY = "vr-training-lrs-v1";
const LRS_QUEUE_KEY = "vr-training-lrs-queue-v1";
const MSG_LRS = "smartcitix:lrs";
const XAPI_VERSION = "1.0.3";
const MAX_QUEUE = 500;
const SEND_BATCH = 50;

/** An https (or http on localhost) URL with its trailing slash trimmed — or null. */
export function cleanEndpoint(v) {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v.trim());
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return null;
    u.hash = ""; u.search = "";
    return u.href.replace(/\/+$/, "");
  } catch (_) { return null; }
}

/**
 * The Authorization header value for a credential typed by a person:
 * "user:secret" becomes Basic, a bare "Basic …"/"Bearer …" is kept, a
 * token with no scheme is treated as Bearer, blank means no header.
 */
export function cleanAuth(v) {
  if (typeof v !== "string") return null;
  const s = v.replace(/[\r\n]/g, "").trim();
  if (!s) return null;
  if (/^(basic|bearer)\s+\S/i.test(s)) return s;
  if (s.includes(":")) {
    try { return `Basic ${btoa(unescape(encodeURIComponent(s)))}`; } catch (_) { return null; }
  }
  return `Bearer ${s}`;
}

function loadQueue() {
  try { const q = JSON.parse(localStorage.getItem(LRS_QUEUE_KEY) || "[]"); return Array.isArray(q) ? q : []; }
  catch (_) { return []; }
}
function saveQueue(q) {
  try { q.length ? localStorage.setItem(LRS_QUEUE_KEY, JSON.stringify(q)) : localStorage.removeItem(LRS_QUEUE_KEY); }
  catch (_) { /* private mode */ }
}

export const Lrs = {
  config: null,
  /** Outcome of the most recent flush, for the status line: { at, sent, error }. */
  last: null,
  _inFlight: null,

  /** Launch-URL endpoint first (then scrubbed), else whatever this tab already has. */
  load() {
    let fromUrl = null;
    try {
      const params = new URLSearchParams(location.search);
      if (params.has("lrs_endpoint")) {
        fromUrl = cleanEndpoint(params.get("lrs_endpoint"));
        params.delete("lrs_endpoint");
        const q = params.toString();
        history.replaceState(null, "", location.pathname + (q ? `?${q}` : "") + location.hash);
      }
    } catch (_) { /* no URL API */ }
    if (fromUrl) this.configure({ endpoint: fromUrl, auth: null });
    else {
      try { const saved = JSON.parse(sessionStorage.getItem(LRS_CONFIG_KEY) || "null"); if (saved?.endpoint) this.config = saved; }
      catch (_) { /* ignore */ }
    }
    return this.config;
  },

  /** Validate and store. Returns the stored config, or null if the endpoint was unusable. */
  configure({ endpoint, auth } = {}) {
    const clean = cleanEndpoint(endpoint);
    if (!clean) return null;
    this.config = { endpoint: clean, auth: cleanAuth(auth) };
    try { sessionStorage.setItem(LRS_CONFIG_KEY, JSON.stringify(this.config)); } catch (_) { /* ignore */ }
    return this.config;
  },

  disconnect() {
    this.config = null; this.last = null;
    try { sessionStorage.removeItem(LRS_CONFIG_KEY); } catch (_) { /* ignore */ }
  },

  get configured() { return !!this.config?.endpoint; },

  pending() { return loadQueue().length; },

  /** Queue statements for sending. No-op (returns 0) while unconfigured. */
  enqueue(statements) {
    if (!this.configured || !Array.isArray(statements) || !statements.length) return 0;
    const q = loadQueue();
    const have = new Set(q.map((s) => s.id));
    let added = 0;
    for (const s of statements) if (s?.id && !have.has(s.id)) { q.push(s); have.add(s.id); added += 1; }
    if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE);
    saveQueue(q);
    return added;
  },

  /**
   * Send the queue in batches. Resolves { sent, pending, error } — never
   * rejects, so callers can fire-and-forget from a results screen. A
   * failed batch stays queued for next time.
   */
  async flush({ fetch = globalThis.fetch } = {}) {
    if (this._inFlight) return this._inFlight;
    this._inFlight = (async () => {
      let sent = 0, error = null;
      if (!this.configured || typeof fetch !== "function") return { sent, pending: this.pending(), error };
      const { endpoint, auth } = this.config;
      while (true) {
        const q = loadQueue();
        if (!q.length) break;
        const batch = q.slice(0, SEND_BATCH);
        try {
          const headers = { "Content-Type": "application/json", "X-Experience-API-Version": XAPI_VERSION };
          if (auth) headers.Authorization = auth;
          const res = await fetch(`${endpoint}/statements`, { method: "POST", headers, body: JSON.stringify(batch), mode: "cors", credentials: "omit" });
          if (!res.ok) { error = `LRS answered ${res.status}`; break; }
          saveQueue(loadQueue().filter((s) => !batch.some((b) => b.id === s.id)));
          sent += batch.length;
        } catch (err) { error = err?.message ?? String(err); break; }
      }
      this.last = { at: new Date().toISOString(), sent, error };
      return { sent, pending: this.pending(), error };
    })();
    try { return await this._inFlight; } finally { this._inFlight = null; }
  },

  /**
   * Queue attempt records (the shape TrainingRecords.record returns) as
   * xAPI statements and send. Resolves like flush(); no-op while unconfigured.
   */
  ship(records, opts) {
    if (!this.configured) return Promise.resolve({ sent: 0, pending: 0, error: null });
    this.enqueue(toXAPI(records, opts).statements);
    return this.flush();
  },

  /**
   * Accept a configuration from the embedding page — only from the origin
   * `trustedOrigin()` names (the learner's home page). Returns unsubscribe.
   */
  listen(trustedOrigin, onChange) {
    const handler = (e) => {
      if (e.data?.type !== MSG_LRS) return;
      const origin = trustedOrigin?.();
      if (!origin || e.origin !== origin) return;
      const cfg = this.configure({ endpoint: e.data.endpoint, auth: e.data.auth });
      if (cfg) onChange?.(cfg);
    };
    addEventListener("message", handler);
    return () => removeEventListener("message", handler);
  },

  /** Plain data for a status line. */
  status() {
    let host = null;
    try { host = this.config ? new URL(this.config.endpoint).host : null; } catch (_) { /* ignore */ }
    return { configured: this.configured, endpoint: this.config?.endpoint ?? null, host, authed: !!this.config?.auth, pending: this.pending(), last: this.last };
  },
};
