/**
 * Parses every shipped module as real JavaScript.
 *
 *     node tools/check_parse.mjs
 *
 * The other checkers load a simulator by stripping its import statements out
 * and concatenating what is left into one module, which is what lets them run
 * headless without a browser. It also means a malformed import line — the one
 * part they delete — is invisible to all of them. Two simulators shipped with
 * a doubled comma in their import list: they threw SyntaxError the moment the
 * app lazy-loaded them, and every checker passed. Nothing here understands the
 * code; it only insists that the parser accepts it, which is the one thing the
 * rest of the suite cannot see.
 *
 * The dist folders are checked too. They are copies, but they are what the
 * browser actually fetches, so a stale copy of a fixed file is a live fault.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== "node_modules") walk(p, out); }
    else if (name.endsWith(".js") || name.endsWith(".mjs")) out.push(p);
  }
  return out;
}

const files = walk(WEBXR).sort();
const broken = [];
for (const file of files) {
  // Parse only. The source goes in on stdin because naming the file would
  // make node resolve its imports too, and these modules import three.js from
  // a CDN that is not reachable here — which would fail every file for a
  // reason that has nothing to do with whether it parses.
  const r = spawnSync(process.execPath, ["--input-type=module", "--check"],
    { input: readFileSync(file, "utf8"), encoding: "utf8" });
  if (r.status !== 0) {
    const line = (r.stderr || "").split("\n").find((l) => /SyntaxError/.test(l)) ?? (r.stderr || "").trim().split("\n")[0];
    broken.push(`${relative(ROOT, file)}: ${line.trim()}`);
  }
}

if (broken.length) {
  for (const b of broken) console.log(`FAIL ${b}`);
  console.log(`\n${broken.length} of ${files.length} modules do not parse.`);
  process.exit(1);
}
console.log(`All ${files.length} shipped modules parse as JavaScript modules.`);
