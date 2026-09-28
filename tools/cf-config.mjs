/**
 * Shared readers for the Cloudflare files (console EDGE): a small TOML reader that covers what
 * wrangler.toml uses here (top-level keys, [tables], [[array tables]], strings, numbers, booleans,
 * one-line arrays), the Pages `_headers` and `_redirects` formats, and the secret-shape scan every
 * deploy file and log is held to. Used by tools/deploy_agent.mjs and tools/check_deploy.mjs; no dependencies.
 */
import { readFileSync } from "node:fs";

/** Parse the subset of TOML wrangler.toml uses. Throws on a line it does not understand. */
export function cfParseToml(text) {
  const root = {};
  let cur = root;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.replace(/^\s+|\s+$/g, "");
    if (!line || line.startsWith("#")) continue;
    let m;
    if ((m = line.match(/^\[\[([A-Za-z0-9_.-]+)\]\]\s*(#.*)?$/))) {
      const key = m[1];
      if (!Array.isArray(root[key])) root[key] = [];
      cur = {};
      root[key].push(cur);
      continue;
    }
    if ((m = line.match(/^\[([A-Za-z0-9_.-]+)\]\s*(#.*)?$/))) {
      const parts = m[1].split(".");
      cur = root;
      for (const p of parts) { cur[p] = cur[p] && typeof cur[p] === "object" ? cur[p] : {}; cur = cur[p]; }
      continue;
    }
    if ((m = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/))) {
      cur[m[1]] = cfTomlValue(m[2], i + 1);
      continue;
    }
    throw new Error(`wrangler.toml line ${i + 1}: cannot read "${raw}"`);
  }
  return root;
}

function cfTomlValue(v, line) {
  let s = v.trim();
  // A trailing comment after a closed value.
  if (!s.startsWith('"') && !s.startsWith("'")) s = s.replace(/\s+#.*$/, "");
  else s = s.replace(/^(("[^"]*")|('[^']*'))\s*#.*$/, "$1");
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (/^"[^"]*"$/.test(s) || /^'[^']*'$/.test(s)) return s.slice(1, -1);
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((x) => cfTomlValue(x, line));
  }
  if (s.startsWith("{") && s.endsWith("}")) {
    const out = {};
    for (const pair of s.slice(1, -1).split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)) {
      const mm = pair.trim().match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
      if (!mm) throw new Error(`wrangler.toml line ${line}: cannot read inline table "${pair}"`);
      out[mm[1]] = cfTomlValue(mm[2], line);
    }
    return out;
  }
  throw new Error(`wrangler.toml line ${line}: cannot read value ${v}`);
}

export const cfReadToml = (path) => cfParseToml(readFileSync(path, "utf8"));

/** Pages `_headers`: [{ path, headers: [[name, value]…] }]. */
export function cfParseHeaders(text) {
  const rules = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) { cur = { path: raw.trim(), headers: [] }; rules.push(cur); continue; }
    const m = raw.trim().match(/^(!?[A-Za-z0-9-]+):\s*(.*)$/);
    if (!m || !cur) throw new Error(`_headers: cannot read "${raw}"`);
    cur.headers.push([m[1], m[2]]);
  }
  return rules;
}

/** Pages `_redirects`: [{ from, to, status }]. */
export function cfParseRedirects(text) {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2 || parts.length > 3) throw new Error(`_redirects: cannot read "${raw}"`);
    const status = parts[2] ? Number(parts[2]) : 302;
    if (![200, 301, 302, 303, 307, 308].includes(status)) throw new Error(`_redirects: bad status in "${raw}"`);
    rules.push({ from: parts[0], to: parts[1], status });
  }
  return rules;
}

/** Whether a Pages path pattern matches a dist-relative file path. */
export function cfPathMatches(pattern, file) {
  const re = new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/:[A-Za-z0-9_]+/g, "[^/]+") + "$");
  return re.test("/" + file.replace(/^\/+/, ""));
}

/**
 * Strings that must never appear in a deploy file, a plan or a log: a Cloudflare API token or Global API
 * key shape, a 32-hex account/zone/namespace id, a Mapbox token, a Stripe-style key, a private key block,
 * a bearer header, or an assignment of one of the credential variables to a literal.
 */
export const CF_SECRET_SHAPES = [
  { name: "a 32-hex id (account, zone or namespace)", re: /\b[0-9a-f]{32}\b/ },
  { name: "a 40-char API token shape", re: /\b[A-Za-z0-9_-]{40}\b/ },
  { name: "a Mapbox token", re: /\b[ps]k\.[A-Za-z0-9_-]{20,}\b/ },
  { name: "a payment-provider key", re: /\b(sk|pk|rk|whsec)_(live|test)_[A-Za-z0-9]{8,}/ },
  { name: "a private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "a bearer credential", re: /Bearer\s+[A-Za-z0-9._-]{16,}/ },
  { name: "a credential assigned to a literal", re: /(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_ZONE_ID|PAYMENTS_WEBHOOK_SECRET|CF_API_TOKEN)\s*[=:]\s*["']?[A-Za-z0-9_-]{8,}/ },
];

/** The first secret shape found in a text, or null. Words that are clearly not secrets are skipped. */
export function cfFindSecret(text) {
  for (const { name, re } of CF_SECRET_SHAPES) {
    const m = text.match(re);
    if (!m) continue;
    // A 40-character run made only of letters is a word, not a token; an all-hex 32 run is always reported.
    if (name.startsWith("a 40-char") && /^[A-Za-z]+$/.test(m[0])) continue;
    return { name, sample: m[0].slice(0, 6) + "…" };
  }
  return null;
}
