/**
 * Catches a helper that is called in one module and defined only in another.
 *
 *     node tools/check_imports.mjs
 *
 * check_parse.mjs proves every module is valid JavaScript. That is not the
 * same as every module working: `escapeHtml` was a private function in
 * SmartCiti.X's app.js and was called five times in Trade Skills' app.js,
 * which parses perfectly and throws ReferenceError the moment a learner
 * finishes a bay — the entire trades debrief screen never rendered. Nothing in
 * the suite could see it, because the checkers build simulator content rather
 * than running the app shell.
 *
 * The rule is deliberately narrow, to stay honest about false positives: a
 * name is only flagged when it is defined somewhere else in this repository,
 * is called as a bare function here, and this module neither declares nor
 * imports it. An unknown global or a browser API is never flagged.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== "node_modules" && name !== "dist") walk(p, out); }
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

// Comments and string literals are not code. The first version of this
// checker reported twenty-one problems and every single one was a function
// name written in a prose comment — "See surface()", "loadSim()/findSim()".
// A checker that cries wolf gets switched off, so strip them first.
function stripNonCode(src) {
  let out = "", i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === "\\") i++;
        // A template literal's ${...} is code, so keep it.
        else if (q === "`" && src[i] === "$" && src[i + 1] === "{") {
          let depth = 1; i += 2; const start = i;
          while (i < src.length && depth) { if (src[i] === "{") depth++; else if (src[i] === "}") depth--; i++; }
          out += " " + src.slice(start, i - 1) + " ";
          continue;
        }
        i++;
      }
      i++; out += " "; continue;
    }
    out += c; i++;
  }
  return out;
}

// Two views of each file, on purpose. Declarations are read from the raw text
// and call sites from the stripped text, so every inaccuracy in the stripper
// makes this checker quieter rather than wrong: a regex literal containing a
// quote confuses any non-parsing stripper, and when that swallowed a chunk of
// the trades app it reported thirteen functions as missing that the file
// defines on its own lines. Missing a real problem is recoverable; crying wolf
// gets a checker switched off.
const files = walk(WEBXR).sort();
const raw = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));
const sources = new Map(files.map((f) => [f, stripNonCode(raw.get(f))]));

// Every name this repository defines at the top level of some module.
const DEFINED = new Map();
const DEF_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:export\s+)?(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm;
for (const [file, src] of raw) {
  for (const m of src.matchAll(DEF_RE)) {
    const name = m[1] ?? m[2];
    if (!DEFINED.has(name)) DEFINED.set(name, []);
    DEFINED.get(name).push(file);
  }
}

const problems = [];
for (const [file, src] of sources) {
  const rawSrc = raw.get(file);
  // What this module declares itself, at any depth — a nested helper counts.
  // Read from the raw text: a name that only appears in a comment here just
  // makes the check quieter about that name in this one file.
  const local = new Set();
  for (const m of rawSrc.matchAll(/(?:function\s+|const\s+|let\s+|var\s+|class\s+)([A-Za-z_$][\w$]*)/g)) local.add(m[1]);
  // Shorthand methods define a name rather than call one: `state(snap) {` in
  // an object literal or a class body reads as a call to any regex that is not
  // parsing, and shared/observer.js was reported for defining its own method.
  for (const m of rawSrc.matchAll(/^\s*(?:async\s+|\*\s*|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm)) local.add(m[1]);
  // Destructured bindings too: `const { announce } = createAnnouncer()`.
  for (const m of rawSrc.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) {
    for (const part of m[1].split(",")) {
      const name = (part.split(":").pop() ?? "").trim().replace(/=.*$/, "").trim();
      if (name) local.add(name);
    }
  }
  // …and what it imports, including default and namespace forms.
  for (const m of rawSrc.matchAll(/import\s+(?:\*\s+as\s+([A-Za-z_$][\w$]*)|\{([^}]*)\}|([A-Za-z_$][\w$]*))\s+from/g)) {
    if (m[1]) local.add(m[1]);
    if (m[3]) local.add(m[3]);
    if (m[2]) for (const part of m[2].split(",")) {
      const as = part.split(/\s+as\s+/);
      const name = (as[1] ?? as[0]).trim();
      if (name) local.add(name);
    }
  }
  // Bare calls: `name(`, not `.name(` and not `function name(`.
  for (const m of src.matchAll(/(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = m[2];
    if (local.has(name) || !DEFINED.has(name)) continue;
    if (/^(if|for|while|switch|catch|return|typeof|new|await|function|super|import)$/.test(name)) continue;
    const where = DEFINED.get(name).filter((f) => f !== file);
    if (!where.length) continue;
    problems.push(`${relative(ROOT, file)}: calls ${name}() — defined only in ${where.map((f) => relative(ROOT, f)).join(", ")}, and not imported here`);
  }
}

const unique = [...new Set(problems)];
if (unique.length) {
  for (const p of unique) console.log(`FAIL ${p}`);
  console.log(`\n${unique.length} cross-module call(s) with no import.`);
  process.exit(1);
}
console.log(`All ${files.length} modules call only what they declare or import.`);
