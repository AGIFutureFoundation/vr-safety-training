// ATMOS's soundscape (console ATMOS, docs/consoles/ATMOS.md): wind, rain, water near rivers, traffic near arterials,
// birds by day, crickets by night and the port's horns — all synthesised with Web Audio (noise buffers, filters and
// oscillators; no audio files). Muted by default: nothing is audible until the learner presses the sound toggle, and
// under reduced motion the toggle stays off (a still, silent world).
//
// Seam:
//   atMountSound({ AudioContext, reduced, seed }) -> { enabled(), setEnabled(on) -> bool, update(mix, t), graph(), master() }
//     `mix` is at-atmos.js atSoundMix(...)'s { wind, rain, water, traffic, birds, crickets, horn } (0..1 each).
//     The graph is built lazily on the first setEnabled(true) (browsers need a gesture) or eagerly by graph() — the
//     checker builds it headlessly against a stand-in AudioContext and reads the master gain.
//
// Every top-level name is prefixed at/AT_.

export const AT_VOICES = ["wind", "rain", "water", "traffic", "birds", "crickets", "horn"];
/** The loudest the whole soundscape gets (master gain when on). */
export const AT_MASTER = 0.35;

/** Build the synth graph on `ctx`: one looping noise buffer shared by the filtered voices, oscillators for the rest. */
export function atBuildGraph(ctx, seed = 1) {
  const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const len = Math.floor((ctx.sampleRate || 44100) * 2);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate || 44100);
  const data = buf.getChannelData(0);
  let a = (0x9e3779b9 ^ seed) >>> 0;
  for (let i = 0; i < len; i++) { a = (Math.imul(a ^ (a >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; data[i] = a / 2147483648 - 1; }
  const voices = {};
  const noiseVoice = (name, type, freq, q) => {
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(master); src.start?.();
    voices[name] = { gain: g, filter: f, src };
  };
  noiseVoice("wind", "lowpass", 420, 0.7);
  noiseVoice("rain", "highpass", 2400, 0.4);
  noiseVoice("water", "bandpass", 700, 0.9);
  noiseVoice("traffic", "lowpass", 160, 0.5);
  const toneVoice = (name, type, freq) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(master); o.start?.();
    voices[name] = { gain: g, osc: o };
  };
  toneVoice("birds", "sine", 3200);
  toneVoice("crickets", "square", 4400);
  toneVoice("horn", "sawtooth", 110);
  return { ctx, master, voices, nodes: 1 + 4 * 3 + 3 * 2 };
}

/** Mount the soundscape. Silent by default and under reduced motion. */
export function atMountSound({ AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext, reduced = false, seed = 1 } = {}) {
  let g = null, on = false;
  const build = () => { if (!g && AudioContext) g = atBuildGraph(new AudioContext(), seed); return g; };
  return {
    enabled: () => on,
    /** Turn sound on or off; refused (stays off) under reduced motion or without Web Audio. Returns the new state. */
    setEnabled(v) {
      on = !!v && !reduced && !!AudioContext;
      if (on) { build(); g.ctx.resume?.(); }
      if (g) g.master.gain.value = on ? AT_MASTER : 0;
      return on;
    },
    /** Follow the mix; birds chirp and crickets pulse by gating their gain on `t` (seconds). Nothing plays while off. */
    update(mix, t = 0) {
      if (!g || !on) return;
      const v = g.voices;
      for (const k of ["wind", "rain", "water", "traffic"]) v[k].gain.gain.value = (mix[k] ?? 0) * (k === "traffic" ? 0.6 : 0.5);
      v.wind.filter.frequency.value = 300 + 500 * (mix.wind ?? 0);
      const chirp = Math.sin(t * 9) > 0.6 && Math.sin(t * 0.7) > 0 ? 1 : 0;
      v.birds.gain.gain.value = (mix.birds ?? 0) * 0.05 * chirp; v.birds.osc.frequency.value = 2800 + 900 * Math.abs(Math.sin(t * 23));
      v.crickets.gain.gain.value = (mix.crickets ?? 0) * 0.02 * (Math.sin(t * 40) > 0.2 && Math.sin(t * 2.1) > -0.3 ? 1 : 0);
      v.horn.gain.gain.value = (mix.horn ?? 0) * 0.08 * ((t % 40) < 2.5 ? 1 : 0); // a long blast every 40 s near the port
    },
    graph: build,
    master: () => g?.master.gain.value ?? 0,
  };
}
