/**
 * An Apple Wallet pass for a membership (console TILL, docs/payments.md §9):
 * the pass.json and manifest.json of a *generic* pass — the level, the
 * member's display name and the membership id; no photo, no barcode, no
 * location. Signing needs a Pass Type ID certificate and key from an Apple
 * developer account and Apple's WWDR certificate; their file paths are read
 * from the environment only (`APPLE_PASS_CERT_PATH`, `APPLE_PASS_KEY_PATH`,
 * `APPLE_WWDR_CERT_PATH`) and used through the system `openssl`. When any is
 * missing the unsigned bundle is returned with `signed: false` and a note
 * that says so. Nothing here holds an identifier, a team id or a key: the
 * pass type identifier and team identifier come from `APPLE_PASS_TYPE_ID` and
 * `APPLE_TEAM_ID` in the environment.
 *
 * A .pkpass is a zip of pass.json, manifest.json and signature (plus icons);
 * this module produces the three documents, the zip is the deployment's
 * packaging step (a known gap, tools/briefs/next/till-next.md).
 */

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function sha1Hex(text) { return hex(await crypto.subtle.digest("SHA-1", enc.encode(text))); }

const text = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);

/** What is wrong with a pass.json for this platform, as a list. */
export function validateApplePass(pass) {
  const errors = [];
  if (!pass || typeof pass !== "object") return ["not an object"];
  if (pass.formatVersion !== 1) errors.push("formatVersion must be 1");
  for (const k of ["passTypeIdentifier", "teamIdentifier", "serialNumber", "organizationName", "description"]) if (typeof pass[k] !== "string" || !pass[k]) errors.push(`${k} missing`);
  if (!pass.generic || !Array.isArray(pass.generic.primaryFields) || !pass.generic.primaryFields.length) errors.push("generic.primaryFields missing");
  for (const bad of ["barcode", "barcodes", "locations", "thumbnail", "nfc"]) if (bad in pass) errors.push(`${bad} is not part of a membership card here`);
  return errors;
}

/**
 * Build the unsigned bundle: `{ pass, manifest, signed: false, note }`.
 * `level` is `{ id, name }`, `memberName` the display name the person typed,
 * `membershipId` the local membership handle (never an e-mail or address).
 */
export async function buildApplePass({ level, memberName, membershipId, env = {}, now = new Date().toISOString() } = {}) {
  const lvl = { id: text(level?.id, 40), name: text(level?.name, 80) || text(level?.id, 40) };
  const name = text(memberName, 40);
  const id = text(membershipId, 60);
  if (!lvl.id || !name || !id) return { ok: false, reason: "a level, a member name and a membership id are needed" };
  const pass = {
    formatVersion: 1,
    passTypeIdentifier: text(env.APPLE_PASS_TYPE_ID, 120) || "PLACEHOLDER.pass.type.identifier",
    teamIdentifier: text(env.APPLE_TEAM_ID, 20) || "PLACEHOLDER",
    serialNumber: id,
    organizationName: text(env.PASS_ORGANIZATION, 80) || "SmartCiti.X ~Holodeck",
    description: "Membership card",
    logoText: "SmartCiti.X",
    foregroundColor: "rgb(242, 246, 250)", backgroundColor: "rgb(16, 23, 34)", labelColor: "rgb(147, 164, 184)",
    generic: {
      primaryFields: [{ key: "level", label: "LEVEL", value: lvl.name }],
      secondaryFields: [{ key: "member", label: "MEMBER", value: name }],
      auxiliaryFields: [{ key: "membership", label: "MEMBERSHIP", value: id }],
      backFields: [
        { key: "issued", label: "Issued", value: now.slice(0, 10) },
        { key: "note", label: "About this card", value: "A membership of the SmartCiti.X ~Holodeck training platform. It is not a licence, a card of qualification or a credential." },
      ],
    },
  };
  const passJson = JSON.stringify(pass, null, 2);
  const manifest = { "pass.json": await sha1Hex(passJson) };
  const bundle = { ok: true, pass, passJson, manifest, manifestJson: JSON.stringify(manifest, null, 2), signed: false, signature: null, note: "unsigned: no Pass Type certificate, key and WWDR certificate paths are set in the environment (APPLE_PASS_CERT_PATH, APPLE_PASS_KEY_PATH, APPLE_WWDR_CERT_PATH)", placeholders: !env.APPLE_PASS_TYPE_ID || !env.APPLE_TEAM_ID };
  return bundle;
}

/**
 * Sign the manifest when the three certificate/key paths exist (a detached
 * PKCS#7 signature through the system openssl, Apple's documented shape);
 * otherwise return the bundle unchanged, still saying it is unsigned.
 */
export async function signApplePass(bundle, env = {}, { fs = null, exec = null } = {}) {
  if (!bundle?.ok) return bundle;
  const paths = [env.APPLE_PASS_CERT_PATH, env.APPLE_PASS_KEY_PATH, env.APPLE_WWDR_CERT_PATH].map((p) => text(p, 400));
  let fsMod = fs, execMod = exec;
  try { fsMod ??= await import("node:fs"); execMod ??= (await import("node:child_process")).execFileSync; } catch (_) { return { ...bundle, note: "unsigned: signing needs a Node runtime with openssl (a Worker returns the unsigned bundle)" }; }
  if (!paths.every((p) => p && fsMod.existsSync(p))) return bundle;
  try {
    const { mkdtempSync, writeFileSync, readFileSync, rmSync } = fsMod;
    const dir = mkdtempSync("/tmp/pkpass-");
    writeFileSync(`${dir}/manifest.json`, bundle.manifestJson);
    execMod("openssl", ["smime", "-binary", "-sign", "-certfile", paths[2], "-signer", paths[0], "-inkey", paths[1], "-in", `${dir}/manifest.json`, "-out", `${dir}/signature`, "-outform", "DER"], { stdio: "pipe" });
    const signature = readFileSync(`${dir}/signature`);
    rmSync(dir, { recursive: true, force: true });
    return { ...bundle, signed: true, signature: signature.toString("base64"), note: "signed with the Pass Type certificate named in the environment" };
  } catch (err) { return { ...bundle, note: `unsigned: openssl could not sign (${String(err?.message ?? err).split("\n")[0]})` }; }
}
