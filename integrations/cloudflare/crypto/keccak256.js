/**
 * A minimal, dependency-free Keccak-256 — the original Keccak padding
 * (domain separation byte 0x01), not NIST's SHA3-256 (0x06), which is the
 * one Ethereum addresses and EIP-191 message digests are built from. No
 * WebCrypto API exposes this variant (SubtleCrypto has no Keccak or SHA3
 * algorithm at all), so it is implemented here in plain JS, in the one place
 * this repository actually needs it: recovering the address behind a
 * `personal_sign` signature (see ../worker.js and ./secp256k1.js).
 *
 * `tools/check_share.mjs` checks this implementation against known
 * Keccak-256 test vectors, so a transcription error in the constants below
 * fails the build rather than silently producing addresses that never
 * match a real wallet's signature.
 */

const MASK64 = (1n << 64n) - 1n;

// The 24 round constants of the Keccak-f[1600] permutation.
const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

// The rho step's per-lane rotation offsets, indexed [x][y].
const ROT = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];

function rotl64(x, n) {
  const bits = n & 63n;
  if (bits === 0n) return x & MASK64;
  return ((x << bits) | (x >> (64n - bits))) & MASK64;
}

/** One in-place Keccak-f[1600] permutation over a 5x5 array of 64-bit lanes. */
function keccakF(state) {
  for (let round = 0; round < 24; round++) {
    // Theta: XOR each lane with the parity of the two neighbouring columns.
    const C = new Array(5);
    for (let x = 0; x < 5; x++) C[x] = state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4];
    const D = new Array(5);
    for (let x = 0; x < 5; x++) D[x] = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1n);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) state[x][y] = (state[x][y] ^ D[x]) & MASK64;

    // Rho (rotate each lane) and Pi (permute lane positions) together.
    const B = [[], [], [], [], []].map(() => new Array(5).fill(0n));
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const nx = y, ny = (2 * x + 3 * y) % 5;
        B[nx][ny] = rotl64(state[x][y], BigInt(ROT[x][y]));
      }
    }

    // Chi: a non-linear mix across each row.
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x][y] = (B[x][y] ^ (~B[(x + 1) % 5][y] & B[(x + 2) % 5][y])) & MASK64;
      }
    }

    // Iota: break the round's symmetry with this round's constant.
    state[0][0] = (state[0][0] ^ RC[round]) & MASK64;
  }
}

/** The legacy Keccak pad10*1 rule with domain byte 0x01 (not SHA3's 0x06). */
function padKeccak(msg, rateBytes) {
  const padLen = rateBytes - (msg.length % rateBytes);
  const out = new Uint8Array(msg.length + padLen);
  out.set(msg);
  out[msg.length] |= 0x01;
  out[out.length - 1] |= 0x80;
  return out;
}

/** Keccak-256 of a byte array, returning a 32-byte Uint8Array. */
export function keccak256(messageBytes) {
  const rateBytes = 136; // 1088-bit rate, 512-bit capacity, for a 256-bit digest
  const input = padKeccak(messageBytes, rateBytes);
  const state = Array.from({ length: 5 }, () => new Array(5).fill(0n));
  for (let offset = 0; offset < input.length; offset += rateBytes) {
    for (let i = 0; i < rateBytes / 8; i++) {
      const x = i % 5, y = Math.floor(i / 5);
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(input[offset + i * 8 + b]);
      state[x][y] = (state[x][y] ^ lane) & MASK64;
    }
    keccakF(state);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    const x = i % 5, y = Math.floor(i / 5);
    let lane = state[x][y];
    for (let b = 0; b < 8; b++) { out[i * 8 + b] = Number(lane & 0xffn); lane >>= 8n; }
  }
  return out;
}

/** Keccak-256 as a lowercase hex string, no "0x" prefix. */
export function keccak256Hex(messageBytes) {
  return [...keccak256(messageBytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
