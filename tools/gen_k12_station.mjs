/**
 * K-12 station generator (console SCHOLAR-2).
 *
 *     node tools/gen_k12_station.mjs tools/k12-data/<slug>.json [...more]
 *
 * Every K-12 station shares one scene layout (a learning wall, desks, shelves,
 * a ring of beads, cards, meters, dials and boards on a station pad) and one
 * thirteen-step shape: find, select, sequence, hold, turn, gauge, drag,
 * select, find, track, record, share, check-in, with the two interruptions
 * armed on the hold and the track steps. Only the words change. This script
 * turns one compact JSON file into WebXR/smartcity/js/sims/<id>.js; after it,
 * run `node tools/add_station.mjs <id>` to register the station.
 *
 * The data files in tools/k12-data/ are self-describing: copy one. Keys
 * (`key`, `spot`, item ids) are short and get the station's `prefix`; step ids
 * come from the first six words of each title unless an `id` is given.
 * check_k12 enforces what this script does not: no digit anywhere in
 * learner-facing text (sequence ordinals "1 · " excepted), no grade or
 * standard codes, a registered framework cited in scope.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = (v) => JSON.stringify(v);
const slug = (t, n = 6) => t.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, n).join("-");
const CERT = "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences";

function gen(d) {
  const P = d.prefix;
  const k = (s) => `${P}-${s}`;
  const S = {};
  for (const key of ["find1", "select1", "seq", "hold", "turn", "gauge", "drag", "select2", "find2", "track", "record", "share"]) S[key] = { ...d[key], id: d[key].id ?? slug(d[key].title) };
  const ind = (s, n) => s.split("\n").map((l, i) => (i ? " ".repeat(n) + l : l)).join("\n");
  // Unquoted identifier keys, as the hand-written stations use: gen_ladder_milestones
  // reads `why:` unquoted and skips a station whose keys are JSON-quoted.
  const obj = (o, n) => ind(JSON.stringify(o, null, 2).replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, "$1$2:"), n);
  const findStep = (f) => ({
    id: f.id, kind: "find", noHint: true,
    targets: f.items.map((i) => k(i[0])),
    itemNames: Object.fromEntries(f.items.map((i) => [k(i[0]), i[1]])),
    itemNotes: Object.fromEntries(f.items.map((i) => [k(i[0]), i[2]])),
    decoyNotes: { [k(f.decoy[0])]: f.decoy[2] },
    title: f.title, cue: f.cue, why: f.why,
  });
  const steps = [
    findStep(S.find1),
    { id: S.select1.id, kind: "select", target: k(S.select1.key), title: S.select1.title, cue: S.select1.cue, why: S.select1.why },
    { id: S.seq.id, kind: "sequence", targets: S.seq.items.map((i) => k(i[0])),
      itemNames: Object.fromEntries(S.seq.items.map((i, n) => [k(i[0]), `${n + 1} · ${i[1]}`])),
      title: S.seq.title, cue: S.seq.cue, why: S.seq.why, outOfOrderNote: S.seq.oon },
    { id: S.hold.id, kind: "hold", target: k(S.hold.key), seconds: 6, title: S.hold.title, cue: S.hold.cue, why: S.hold.why, holdBreakNote: S.hold.brk },
    { id: S.turn.id, kind: "turn", target: k(S.turn.key), turn: { turns: 0.5, axis: "y", label: S.turn.dial }, title: S.turn.title, cue: S.turn.cue, why: S.turn.why },
    { id: S.gauge.id, kind: "gauge", target: k(S.gauge.key), gauge: { label: S.gauge.meter, speed: 0.6, green: [0.4, 0.58], missNote: S.gauge.miss }, title: S.gauge.title, cue: S.gauge.cue, why: S.gauge.why },
    { id: S.drag.id, kind: "drag", target: k(S.drag.key), drag: { to: k(S.drag.spot), radius: 0.45, missNote: S.drag.miss }, title: S.drag.title, cue: S.drag.cue, why: S.drag.why },
    { id: S.select2.id, kind: "select", target: k(S.select2.key), title: S.select2.title, cue: S.select2.cue, why: S.select2.why },
    findStep(S.find2),
    { id: S.track.id, kind: "track", target: k(S.track.key), seconds: 8, track: { start: 0.3, green: [0.4, 0.62], rise: 0.46, fall: 0.38, drift: 0.14, label: S.track.meter }, title: S.track.title, cue: S.track.cue, why: S.track.why, holdBreakNote: S.track.brk },
    { id: S.record.id, kind: "select", target: k(S.record.key), doneLine: S.record.done, title: S.record.title, cue: S.record.cue, why: S.record.why },
    { id: S.share.id, kind: "select", target: k(S.share.key), doneLine: S.share.done, title: S.share.title, cue: S.share.cue, why: S.share.why },
    { id: "crew-check-in", kind: "select", target: k("checkin"), doneLine: "Checked in", title: d.checkin.title, cue: d.checkin.cue, why: d.checkin.why },
  ];
  const ints = d.interrupts.map((it, n) => ({
    id: it.id, kind: it.kind, after: n === 0 ? S.hold.id : S.track.id, delay: 3, seconds: 12, target: k(it.key),
    alert: it.alert, cue: it.cue, why: it.why, missNote: it.miss, wrongNote: it.wrong,
  }));
  const hazards = Object.fromEntries(d.hazards.map((h) => [h.id, h.text]));
  const lateNotes = { [k(S.record.key)]: d.lateRecord, [k("checkin")]: d.lateCheckin };
  const exp = "SIM_" + d.id.toUpperCase().replace(/-/g, "_");
  const acc = d.accent.replace("#", "0x");
  const [f0, f1] = d.floor ?? ["#7a7d80", "#6c6f72"];
  const [w0, w1] = d.wall ?? ["#e8e2d4", "#dcd6c8"];

  // the controls, laid out on the fixed ring shared by every K-12 station
  const BEADS = [[-1.22, 0.9, -0.27], [-1.42, 1.18, -0.62], [-1.03, 1.46, -0.71], [-1.08, 0.9, -1.11], [-0.68, 1.18, -1.05], [-0.58, 1.46, -1.44], [-0.24, 0.9, -1.23], [0, 1.18, -1.55], [0.24, 1.46, -1.23], [0.58, 0.9, -1.44], [0.68, 1.18, -1.05], [1.08, 1.46, -1.11], [1.03, 0.9, -0.71], [1.42, 1.18, -0.62], [1.22, 1.46, -0.27]];
  const beadRows = [
    ...S.find1.items.map((i) => [i[0], i[1], ""]),
    [S.find1.decoy[0], S.find1.decoy[1], `{ color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 }`],
    ...S.seq.items.map((i, n) => [i[0], `${n + 1} · ${i[1]}`, ""]),
    [S.hold.key, S.hold.label, ""],
    ...S.find2.items.map((i) => [i[0], i[1], ""]),
    [S.find2.decoy[0], S.find2.decoy[1], `{ color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 }`],
    ...d.interrupts.map((it) => [it.key, it.label, `{ color: 0x59c97b, css: "#59c97b", r: 0.03 }`]),
  ];
  const beadLines = beadRows.map((b, n) => `    bead(${BEADS[n].join(", ")}, ${J(k(b[0]))}, ${J(b[1])}, ${b[2] || "{}"});`).join("\n");
  const HZ = [[-1.53, -1.21, 0.9], [-0.58, -1.86, 0.3], [0.58, -1.86, -0.3], [1.53, -1.21, -0.9]];
  const hzLines = d.hazards.map((h, n) => `    hazardCard(${HZ[n][0]}, 0.72, ${HZ[n][1]}, ${J(h.id)}, ${J(h.label)}, ${J(h.face)}, ${HZ[n][2]});`).join("\n");
  const crew = d.crew;
  const [i1, i2] = d.interrupts;

  return `import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — ${d.name}. ${d.header}
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const ${exp} = {
  id: ${J(d.id)},
  index: ${J(d.index)},
  domain: "Education",
  trade: ${J(d.trade)},
  category: "Community Environmental Justice",
  weather: "clear",
  certification: ${J(d.certification ?? CERT)},
  name: ${J(d.name)},
  title: simTitle(${J(d.name)}),
  tagline: ${J(d.tagline)},
  accent: ${acc},
  accentCss: ${J(d.accent)},
  parSeconds: 330,
  footprint: 2.6,
  badge: ${J(d.badge)},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: ${J(d.board.name)},
    currency: ${J(d.board.currency)},
    ranks: ${J(d.board.ranks)},
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean(${J(S.find1.id)}) },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: ${obj(hazards, 2)},

  lateNotes: ${obj(lateNotes, 2)},

  steps: ${obj(steps, 2)},

  interrupts: ${obj(ints, 2)},

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = ${acc};
    const CSS = ${J(d.accent)};
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = \`600 \${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif\`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = \`\${Math.round(h * 0.075)}px Arial, sans-serif\`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: ${J(f0)}, base2: ${J(f1)}, seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: ${J(w0)}, base2: ${J(w1)}, seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a learning wall behind the station, with a board the class works on
    const wall = group(g, 0, 0, -4.7);
    box(wall, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    box(wall, 2.6, 1.2, 0.03, 0, 1.55, 0.08, 0x2f4a3a, { rough: 0.9 });
    box(wall, 2.7, 0.05, 0.08, 0, 0.93, 0.1, 0xb89a6a, { rough: 0.6 });
    for (let i = 0; i < 5; i++) box(wall, 0.34, 0.24, 0.02, -2.6 + i * 0.3 + (i > 2 ? 3.1 : 0) - (i > 2 ? 0.9 : 0), 1.8, 0.08, [0xf2c14b, 0x7fc4d8, 0xf0a0a0, 0xa0e0a0, 0xd0b0f0][i], { rough: 0.8 });
    // desks and stools for the class, clear of every control
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1, k = i % 2;
      const desk = group(g, side * (3.2 + (k % 2) * 0.2), 0, -2.4 + k * 1.3, side * 0.3);
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 5930936, { rough: 0.6 });
      for (const [lx, lz] of [[-0.4, -0.23], [0.4, -0.23], [-0.4, 0.23], [0.4, 0.23]]) box(desk, 0.035, 0.72, 0.035, lx, 0.36, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
      box(desk, 0.3, 0.02, 0.22, 0.1, 0.77, 0, 0xf4f0e6, { rough: 0.9 });
      const stool = group(desk, 0, 0, 0.55);
      cyl(stool, 0.16, 0.16, 0.04, 0, 0.45, 0, 0x2b2f35, { rough: 0.6, seg: 14 });
      for (let a = 0; a < 3; a++) box(stool, 0.03, 0.44, 0.03, Math.sin(a * 2.1) * 0.11, 0.22, Math.cos(a * 2.1) * 0.11, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    // shelves of the lesson's materials
    for (const sx of [-2.9, 2.9]) {
      const sh = group(g, sx, 0, -4.2);
      box(sh, 1.0, 1.6, 0.34, 0, 0.8, 0, 0x6b4a2e, { rough: 0.7 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) box(sh, 0.18, 0.28, 0.24, -0.33 + c * 0.22, 0.3 + r * 0.5, 0.04, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.8 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
${beadLines}
    card(-2.19, 1.35, -0.85, ${J(k(S.select1.key))}, ${J(S.select1.label)}, ${J(S.select1.face)}, { ry: 1.2 });
    dials[${J(k(S.turn.key))}] = dial(-1.89, -1.4, 0.93, ${J(k(S.turn.key))}, ${J(S.turn.label)});
    meters[${J(k(S.gauge.key))}] = meter(-1.45, -1.85, 0.67, ${J(k(S.gauge.key))}, ${J(S.gauge.label)});
    tokens[${J(k(S.drag.key))}] = token(-0.92, -2.16, 0.4, ${J(k(S.drag.key))}, ${J(S.drag.label)});
    spots[${J(k(S.drag.spot))}] = spot(-0.31, -2.33, 0.13, ${J(k(S.drag.spot))}, ${J(S.drag.spotLabel)});
    card(0.31, 1.35, -2.33, ${J(k(S.select2.key))}, ${J(S.select2.label)}, ${J(S.select2.face)}, { ry: -0.13 });
    meters[${J(k(S.track.key))}] = meter(0.92, -2.16, -0.4, ${J(k(S.track.key))}, ${J(S.track.label)});
    boards[${J(k(S.record.key))}] = board(1.45, -1.85, -0.67, ${J(k(S.record.key))}, ${J(S.record.label)});
    boards[${J(k(S.share.key))}] = board(1.89, -1.4, -0.93, ${J(k(S.share.key))}, ${J(S.share.label)});
    boards[${J(k("checkin"))}] = board(2.19, -0.85, -1.2, ${J(k("checkin"))}, ${J(d.checkin.label)});
${hzLines}

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", [${J(d.guide.start)}], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = \`\${Math.round(h * 0.1)}px Arial, sans-serif\`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? \`\${line} \${word}\` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, ${J(crew[0])}, 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, ${J(crew[1])}, -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, ${J(crew[2])}, -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, ${J(crew[3])}, 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals[${J(i1.id)}] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals[${J(i1.id)}].visible = false;
    arrivals[${J(i2.id)}] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals[${J(i2.id)}].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === ${J(S.drag.id)}) { const s = spots[${J(k(S.drag.spot))}]; tokens[${J(k(S.drag.key))}].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === ${J(S.record.id)}) repaint(boards[${J(k(S.record.key))}].userData.face, (cx, w, h) => text(cx, w, h, "DONE", [${J(S.record.done)}], "#59c97b"));
        if (step.id === ${J(S.share.id)}) repaint(boards[${J(k(S.share.key))}].userData.face, (cx, w, h) => text(cx, w, h, "DONE", [${J(S.share.done)}], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards[${J(k("checkin"))}].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === ${J(S.select2.id)}) paintGuide(${J(d.guide.after)});
      },

      onHazard() {
        paintGuide(${J(d.guide.hazard)});
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === ${J(i1.id)}) { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide(${J(i1.done)}); }
        if (it.id === ${J(i2.id)}) { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide(${J(i2.done)}); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
`;
}

for (const f of process.argv.slice(2)) {
  const d = JSON.parse(readFileSync(f, "utf8"));
  const out = join(ROOT, "WebXR/smartcity/js/sims", `${d.id}.js`);
  writeFileSync(out, gen(d));
  console.log(`wrote ${out.replace(ROOT + "/", "")}`);
}
