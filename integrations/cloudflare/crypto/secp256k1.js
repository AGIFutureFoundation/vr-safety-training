/**
 * Just enough secp256k1 to recover the Ethereum address behind an EIP-191
 * `personal_sign` signature — `recoverAddress()` is the one function
 * ../worker.js actually calls. There is no private-key handling anywhere in
 * this repository's runtime code path: this module only ever runs on a
 * signature and a public address that were already produced by someone
 * else's wallet.
 *
 * WebCrypto has no secp256k1 curve (SubtleCrypto's EC algorithms cover only
 * P-256/P-384/P-521), so this is plain-JS BigInt affine-point arithmetic —
 * a few hundred elliptic-curve operations per verification, which is fine
 * for a relay checking one signature per share.
 *
 * `signPersonalMessage()` is exported only so `tools/check_share.mjs` can
 * build a real, valid signature from a throwaway keypair generated at test
 * time and check `recoverAddress()` against it — the fixture the task asks
 * for. Nothing in ../worker.js's request handler calls it; a real wallet's
 * own extension does this signing, never a page or a relay.
 */

import { keccak256 } from "./keccak256.js";

export const P = (1n << 256n) - (1n << 32n) - 977n;
export const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
export const G = {
  x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
};

export function mod(a, m = P) { const r = a % m; return r < 0n ? r + m : r; }

function modPow(base, exp, m) {
  let b = mod(base, m), result = 1n, e = exp;
  while (e > 0n) {
    if (e & 1n) result = mod(result * b, m);
    b = mod(b * b, m);
    e >>= 1n;
  }
  return result;
}

/** Modular inverse by the extended Euclidean algorithm. */
export function modInv(a, m = P) {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error("secp256k1: value has no modular inverse");
  return mod(oldS, m);
}

/** A modular square root, valid because secp256k1's p is 3 mod 4. Returns
 * null when `a` is not a quadratic residue (the recovered x is not on the curve). */
function modSqrt(a) {
  const r = modPow(a, (P + 1n) / 4n, P);
  return mod(r * r) === mod(a) ? r : null;
}

/** Affine point addition on y^2 = x^3 + 7 (secp256k1's a = 0, b = 7). `null`
 * stands for the point at infinity. */
export function pointAdd(p1, p2) {
  if (p1 === null) return p2;
  if (p2 === null) return p1;
  if (p1.x === p2.x) {
    if (mod(p1.y + p2.y) === 0n) return null; // p2 == -p1
    const m = mod(3n * p1.x * p1.x * modInv(2n * p1.y));
    const x3 = mod(m * m - 2n * p1.x);
    const y3 = mod(m * (p1.x - x3) - p1.y);
    return { x: x3, y: y3 };
  }
  const m = mod((p2.y - p1.y) * modInv(p2.x - p1.x));
  const x3 = mod(m * m - p1.x - p2.x);
  const y3 = mod(m * (p1.x - x3) - p1.y);
  return { x: x3, y: y3 };
}

/** Double-and-add scalar multiplication. `k` is reduced mod the curve order
 * first, which is valid for any point since secp256k1 has prime order (no
 * cofactor). */
export function scalarMul(k, point) {
  let result = null, addend = point, n = mod(k, N);
  while (n > 0n) {
    if (n & 1n) result = pointAdd(result, addend);
    addend = pointAdd(addend, addend);
    n >>= 1n;
  }
  return result;
}

export function bytesToBigInt(bytes) {
  let r = 0n;
  for (const b of bytes) r = (r << 8n) | BigInt(b);
  return r;
}
export function bigIntToBytes(x, len) {
  const out = new Uint8Array(len);
  let v = x;
  for (let i = len - 1; i >= 0; i--) { out[i] = Number(v & 0xffn); v >>= 8n; }
  return out;
}
function hexToBytes(hex) {
  const s = typeof hex === "string" && hex.startsWith("0x") ? hex.slice(2) : String(hex ?? "");
  if (s.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(s)) return null;
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
  return out;
}
function bytesToHex(bytes) { return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }

/**
 * The EIP-191 `personal_sign` digest: Ethereum's fixed prefix, the message's
 * own byte length, then the message — hashed with Keccak-256. This is the
 * exact byte sequence a wallet's `personal_sign` implicitly signs, so the
 * text a person is shown is the text this recovers a signer from.
 */
export function ethMessageHash(message) {
  const msgBytes = typeof message === "string" ? new TextEncoder().encode(message) : message;
  const prefix = new TextEncoder().encode(`\x19Ethereum Signed Message:\n${msgBytes.length}`);
  const full = new Uint8Array(prefix.length + msgBytes.length);
  full.set(prefix, 0); full.set(msgBytes, prefix.length);
  return keccak256(full);
}

/**
 * ECDSA public-key recovery: given the message hash and a signature's (r, s,
 * recoveryId), returns the point that produced it, or null when the
 * signature is malformed (an x-coordinate off the curve, or a component
 * that has no inverse). `recoveryId` is 0 or 1 for the ordinary case — the
 * `>= 2` "x overflow" branch exists only for completeness and essentially
 * never occurs with a real signature.
 */
export function recoverPublicKey(msgHash, r, s, recoveryId) {
  if (r <= 0n || r >= N || s <= 0n || s >= N) return null;
  const x = recoveryId >= 2 ? r + N : r;
  if (x >= P) return null;
  const alpha = mod(x * x * x + 7n, P);
  let y = modSqrt(alpha);
  if (y === null) return null;
  const wantOdd = (recoveryId & 1) === 1;
  if (((y & 1n) === 1n) !== wantOdd) y = mod(P - y);
  const R = { x, y };
  let rInv;
  try { rInv = modInv(r, N); } catch (_) { return null; }
  const sR = scalarMul(s, R);
  const negEG = scalarMul(mod(N - mod(msgHash, N), N), G); // (-e mod n) * G
  const sum = pointAdd(sR, negEG);
  if (!sum) return null;
  return scalarMul(rInv, sum);
}

/** The Ethereum address for an uncompressed public-key point: the low 20
 * bytes of Keccak-256(x || y), 0x-prefixed lowercase hex. */
export function pubKeyToAddress(pub) {
  const bytes = new Uint8Array(64);
  bytes.set(bigIntToBytes(pub.x, 32), 0);
  bytes.set(bigIntToBytes(pub.y, 32), 32);
  return "0x" + bytesToHex(keccak256(bytes).slice(12));
}

/**
 * Recover the signing address from a message and a 65-byte `personal_sign`
 * signature (`0x` + r(32) + s(32) + v(1), v = 27/28 or 0/1). Returns a
 * lowercase `0x…` address, or `null` for anything malformed — never throws.
 */
export function recoverAddress(message, signatureHex) {
  const sig = hexToBytes(signatureHex);
  if (!sig || sig.length !== 65) return null;
  const r = bytesToBigInt(sig.slice(0, 32));
  const s = bytesToBigInt(sig.slice(32, 64));
  let v = sig[64];
  if (v >= 27) v -= 27;
  if (v < 0 || v > 3) return null;
  const pub = recoverPublicKey(bytesToBigInt(ethMessageHash(message)), r, s, v);
  return pub ? pubKeyToAddress(pub) : null;
}

// ---------------------------------------------------------- test fixtures
//
// Everything below signs with a private key. It exists only so
// tools/check_share.mjs can build a real signature to recover against; nothing
// in this repository's served pages or its worker handler ever imports or
// calls it.

/** The address a given private key (as a BigInt < N) controls. Test/fixture use only. */
export function privateKeyToAddress(privateKey) {
  return pubKeyToAddress(scalarMul(mod(privateKey, N), G));
}

/** A byte array's Keccak-256 as a BigInt — used only to derive a
 * test-fixture nonce deterministically, never anything a real signer relies on. */
function deterministicNonce(seed) { return mod(bytesToBigInt(keccak256(bigIntToBytes(mod(seed, N), 32))), N); }

/**
 * Sign an EIP-191 personal message with a raw private key. Test/fixture use
 * only — see the module note above. Retries with a bumped nonce on the rare
 * degenerate draw (r, s or the recovered y all deterministic, so this is
 * reproducible across a run rather than depending on real randomness).
 */
export function signPersonalMessage(privateKey, message) {
  const hash = bytesToBigInt(ethMessageHash(message));
  let nonce = deterministicNonce(privateKey + hash) || 1n;
  for (let attempt = 0; attempt < 32; attempt++) {
    const R = scalarMul(nonce, G);
    const r = mod(R.x, N);
    if (r === 0n) { nonce = deterministicNonce(nonce + 1n) || 1n; continue; }
    let s, yIsOdd = (R.y & 1n) === 1n;
    try { s = mod(modInv(nonce, N) * mod(hash + r * privateKey, N), N); }
    catch (_) { nonce = deterministicNonce(nonce + 1n) || 1n; continue; }
    if (s === 0n) { nonce = deterministicNonce(nonce + 1n) || 1n; continue; }
    if (s > N / 2n) { s = mod(N - s, N); yIsOdd = !yIsOdd; } // canonical low-s form
    const sig = new Uint8Array(65);
    sig.set(bigIntToBytes(r, 32), 0);
    sig.set(bigIntToBytes(s, 32), 32);
    sig[64] = 27 + (yIsOdd ? 1 : 0);
    return "0x" + bytesToHex(sig);
  }
  throw new Error("signPersonalMessage: failed to find a usable nonce");
}
