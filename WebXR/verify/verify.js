// Open Badges 2.0 assertion verifier — the checks a third party can make on
// a credential exported from SmartCiti.X, Trade Skills Simulator or Holodeck
// without the issuing hall's cooperation: is it a well-formed assertion, is
// the badge class complete, is the issuer named, are the dates sane, and,
// where the hall hosts its assertions, does the hosted copy match. Plain
// module, no dependencies, so it runs in the page and in the checker.

const OB_CONTEXT = "https://w3id.org/openbadges/v2";
const isUrl = (s) => typeof s === "string" && /^https?:\/\/[^\s]+$/i.test(s);
const isIso = (s) => typeof s === "string" && !Number.isNaN(Date.parse(s));

/** Deep structural equality with key order ignored (for hosted comparison). */
export function sameJson(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => sameJson(v, b[i]));
  if (typeof a === "object") {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i] && sameJson(a[k], b[k]));
  }
  return false;
}

/** Structural checks. Returns { ok, checks: [{name, ok, note}], summary }. */
export function validateAssertion(a, { now = Date.now() } = {}) {
  const checks = [];
  const add = (name, ok, note = "") => checks.push({ name, ok: !!ok, note });
  if (!a || typeof a !== "object" || Array.isArray(a)) {
    add("Assertion is a JSON object", false, "not an object");
    return { ok: false, checks, summary: null };
  }
  add("Open Badges 2.0 context", a["@context"] === OB_CONTEXT, String(a["@context"] ?? "missing"));
  add("Type is Assertion", a.type === "Assertion", String(a.type ?? "missing"));
  add("Assertion id is a URL", isUrl(a.id), String(a.id ?? "missing"));
  const r = a.recipient;
  add("Recipient identified", r && typeof r === "object" && typeof r.identity === "string" && r.identity.length > 0 && ["url", "email", "id", "telephone"].includes(r.type),
    r ? `${r.type ?? "?"}: ${r.identity ?? "?"}${r.hashed ? " (hashed)" : ""}` : "missing");
  add("issuedOn is a date", isIso(a.issuedOn), String(a.issuedOn ?? "missing"));
  add("issuedOn is not in the future", isIso(a.issuedOn) && Date.parse(a.issuedOn) <= now + 5 * 60 * 1000, isIso(a.issuedOn) ? new Date(a.issuedOn).toISOString().slice(0, 10) : "—");
  if (a.expires !== undefined) add("Not expired", isIso(a.expires) && Date.parse(a.expires) > now, String(a.expires));
  const v = a.verification;
  add("Verification type is hosted", v && v.type === "hosted", v ? String(v.type) + (v.type === "SignedBadge" ? " — signed badges are not checked here" : "") : "missing");
  const b = a.badge;
  const badgeObj = b && typeof b === "object";
  add("BadgeClass is embedded", badgeObj && b.type === "BadgeClass", badgeObj ? String(b.type) : isUrl(b) ? "referenced by URL only — fetch it to check" : "missing");
  add("BadgeClass id is a URL", badgeObj && isUrl(b.id), badgeObj ? String(b.id ?? "missing") : "—");
  add("Badge has a name", badgeObj && typeof b.name === "string" && b.name.trim().length > 0, badgeObj ? String(b.name ?? "missing") : "—");
  add("Badge has a description", badgeObj && typeof b.description === "string" && b.description.trim().length >= 20, badgeObj ? `${(b.description ?? "").length} chars` : "—");
  add("Badge states its criteria", badgeObj && b.criteria && (typeof b.criteria.narrative === "string" || isUrl(b.criteria.id ?? b.criteria)), badgeObj ? (b.criteria?.narrative ? "narrative" : "missing") : "—");
  const iss = badgeObj ? b.issuer : null;
  add("Issuer is a named Profile", iss && typeof iss === "object" && iss.type === "Profile" && typeof iss.name === "string" && iss.name.length > 0 && isUrl(iss.url ?? iss.id),
    iss ? `${iss.name ?? "?"} <${iss.url ?? iss.id ?? "?"}>` : "missing");
  add("Badge image present", badgeObj && typeof b.image === "string" && (b.image.startsWith("data:image/") || isUrl(b.image)), badgeObj ? (b.image ? (b.image.startsWith("data:") ? "embedded" : "URL") : "missing") : "—");
  add("Evidence attached", Array.isArray(a.evidence) && a.evidence.length > 0 && a.evidence.every((e) => e && (typeof e.narrative === "string" || isUrl(e.id))), Array.isArray(a.evidence) ? `${a.evidence.length} item(s)` : "none");
  const placeholderHome = typeof a.id === "string" && /smartciti\.example/i.test(a.id);
  add("Issuer home is a real host", !placeholderHome, placeholderHome ? "smartciti.example is the placeholder used when no learner_home was given — the hall has not hosted this assertion" : "ok");
  const ok = checks.every((c) => c.ok);
  const summary = {
    badge: badgeObj ? b.name : null, description: badgeObj ? b.description : null, issuer: iss?.name ?? null, issuerUrl: iss?.url ?? iss?.id ?? null,
    recipient: r?.name ?? r?.identity ?? null, issuedOn: a.issuedOn ?? null, id: a.id ?? null, tags: badgeObj ? b.tags ?? [] : [],
    evidence: Array.isArray(a.evidence) ? a.evidence.map((e) => e.narrative ?? e.id) : [],
  };
  return { ok, checks, summary };
}

/** Hosted verification: fetch the assertion at its own id and compare. */
export async function verifyHosted(a, fetchImpl = typeof fetch === "function" ? fetch : null) {
  if (!a || !isUrl(a.id)) return { status: "skipped", note: "no assertion id to fetch" };
  if (!fetchImpl) return { status: "unavailable", note: "no fetch in this environment" };
  try {
    const res = await fetchImpl(a.id, { headers: { Accept: "application/json" } });
    if (!res.ok) return { status: "unreachable", note: `HTTP ${res.status} from ${a.id}` };
    const hosted = await res.json();
    return sameJson(hosted, a) ? { status: "matched", note: "hosted copy is identical to the presented assertion" } : { status: "mismatch", note: "hosted copy differs from the presented assertion" };
  } catch (e) {
    return { status: "unreachable", note: `could not fetch ${a.id}: ${e?.message ?? e}` };
  }
}

/** Accepts a single assertion, an array, or a wrapper { assertions: [...] }. */
export function parseInput(text) {
  const data = JSON.parse(text);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.assertions)) return data.assertions;
  return [data];
}

/** One-line verdict a person can read. */
export function verdict(result, hosted) {
  if (!result.ok) return { level: "fail", text: `Not a valid Open Badges 2.0 assertion — ${result.checks.filter((c) => !c.ok).length} check(s) failed.` };
  if (hosted?.status === "matched") return { level: "pass", text: "Valid assertion and the hosted copy matches: the issuing hall stands behind it." };
  if (hosted?.status === "mismatch") return { level: "fail", text: "Structurally valid, but the hosted copy differs — treat as altered." };
  if (hosted?.status === "unreachable") return { level: "warn", text: "Structurally valid; the hosted copy could not be fetched, so the issuer has not confirmed it." };
  return { level: "warn", text: "Structurally valid. Hosted verification not attempted — the credential is self-asserted until the hosted copy is checked." };
}
