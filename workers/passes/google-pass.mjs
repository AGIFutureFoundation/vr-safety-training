/**
 * A Google Wallet pass for a membership (console TILL, docs/payments.md §9):
 * the Generic pass class and object — the level, the member's display name
 * and the membership id — and the "Save to Google Wallet" JWT, signed only
 * when a Google Wallet issuer's service-account key file path exists in the
 * environment (`GOOGLE_WALLET_SA_KEY_PATH`; the issuer id from
 * `GOOGLE_WALLET_ISSUER_ID`). Without them the class and object are returned
 * with `jwt: null` and a note that says so. Nothing here holds an issuer id
 * or a key.
 */

const text = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** What is wrong with a generic object for this platform, as a list. */
export function validateGooglePass(obj) {
  const errors = [];
  if (!obj || typeof obj !== "object") return ["not an object"];
  if (!/^[^.]+\.[A-Za-z0-9_-]+$/.test(String(obj.id ?? ""))) errors.push("id must read <issuerId>.<suffix>");
  if (typeof obj.classId !== "string" || !obj.classId) errors.push("classId missing");
  if (obj.state !== "ACTIVE") errors.push("state must be ACTIVE");
  if (!obj.cardTitle?.defaultValue?.value || !obj.header?.defaultValue?.value) errors.push("cardTitle and header needed");
  for (const bad of ["barcode", "heroImage", "imageModulesData", "locations"]) if (bad in obj) errors.push(`${bad} is not part of a membership card here`);
  return errors;
}

/** The class and object; the issuer id is a placeholder until the environment names one. */
export function buildGooglePass({ level, memberName, membershipId, env = {}, now = new Date().toISOString() } = {}) {
  const lvl = { id: text(level?.id, 40), name: text(level?.name, 80) || text(level?.id, 40) };
  const name = text(memberName, 40);
  const id = text(membershipId, 60).replace(/[^A-Za-z0-9_-]/g, "_");
  if (!lvl.id || !name || !id) return { ok: false, reason: "a level, a member name and a membership id are needed" };
  const issuerId = text(env.GOOGLE_WALLET_ISSUER_ID, 40) || "PLACEHOLDER_ISSUER";
  const classId = `${issuerId}.smartcitix-membership-${lvl.id}`;
  const genericClass = { id: classId, classTemplateInfo: { cardTemplateOverride: { cardRowTemplateInfos: [{ oneItem: { item: { firstValue: { fields: [{ fieldPath: "object.textModulesData['membership']" }] } } } }] } } };
  const genericObject = {
    id: `${issuerId}.${id}`, classId, state: "ACTIVE",
    cardTitle: { defaultValue: { language: "en", value: "SmartCiti.X ~Holodeck membership" } },
    header: { defaultValue: { language: "en", value: lvl.name } },
    subheader: { defaultValue: { language: "en", value: name } },
    hexBackgroundColor: "#101722",
    textModulesData: [
      { id: "membership", header: "Membership", body: id },
      { id: "issued", header: "Issued", body: now.slice(0, 10) },
      { id: "note", header: "About this card", body: "A membership of the training platform; not a licence, a card of qualification or a credential." },
    ],
  };
  return { ok: true, issuerId, placeholders: !env.GOOGLE_WALLET_ISSUER_ID, genericClass, genericObject, jwt: null, note: "no Save to Google Wallet link: no service-account key path is set in the environment (GOOGLE_WALLET_SA_KEY_PATH)" };
}

/**
 * The "Save to Google Wallet" JWT (RS256, `typ: savetowallet`, `aud: google`)
 * signed with the service account's private key from the file the
 * environment names — only when that file exists. Otherwise the bundle
 * comes back unchanged with `jwt: null`.
 */
export async function buildGoogleSaveJwt(bundle, env = {}, { fs = null, cryptoMod = null, now = Math.floor(Date.now() / 1000) } = {}) {
  if (!bundle?.ok) return bundle;
  const path = text(env.GOOGLE_WALLET_SA_KEY_PATH, 400);
  let fsMod = fs, cr = cryptoMod;
  try { fsMod ??= await import("node:fs"); cr ??= await import("node:crypto"); } catch (_) { return { ...bundle, note: "no Save link: signing needs a Node runtime (a Worker returns the unsigned bundle)" }; }
  if (!path || !fsMod.existsSync(path)) return bundle;
  try {
    const key = JSON.parse(fsMod.readFileSync(path, "utf8"));
    if (!key.client_email || !key.private_key) return { ...bundle, note: "no Save link: the key file lacks client_email or private_key" };
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = b64url(JSON.stringify({ iss: key.client_email, aud: "google", typ: "savetowallet", iat: now, origins: Array.isArray(env.GOOGLE_WALLET_ORIGINS) ? env.GOOGLE_WALLET_ORIGINS : [], payload: { genericClasses: [bundle.genericClass], genericObjects: [bundle.genericObject] } }));
    const signer = cr.createSign("RSA-SHA256"); signer.update(`${header}.${payload}`);
    const sig = b64url(signer.sign(key.private_key));
    const jwt = `${header}.${payload}.${sig}`;
    return { ...bundle, jwt, saveUrl: `https://pay.google.com/gp/v/save/${jwt}`, note: "signed with the service account named in the environment" };
  } catch (err) { return { ...bundle, note: `no Save link: ${String(err?.message ?? err).split("\n")[0]}` }; }
}
