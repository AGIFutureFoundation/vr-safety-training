// Night Highway Circuit — sound.
//
// Everything is synthesised on the spot with WebAudio: an engine voice per
// local player (two detuned oscillators through a low-pass filter whose pitch
// follows the speed), short cheerful effects for the items and the race
// events, and a quiet looping backing track written for this game (a plain
// four-chord bass-and-arpeggio pattern). No sample files, nothing borrowed.
// Browsers only start audio after a user gesture, so nothing sounds until
// resume() is called from one.

export function rcCreateAudio() {
  let ctx = null, master = null, sfx = null, bus = null, muted = false, musicOn = true, musicTimer = null, step = 0, nextAt = 0;
  const engines = [];

  function ensure() {
    if (ctx) return ctx;
    const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
    master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    bus = ctx.createGain(); bus.gain.value = 0.16; bus.connect(master);
    return ctx;
  }

  function tone(freq, dur, type = "square", vol = 0.18, when = 0, slideTo = null, out = null) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out ?? sfx);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  let noiseBuf = null;
  function noise(dur, vol = 0.2, freq = 1200, when = 0, sweepTo = null, q = 0.8) {
    if (!ensure() || muted) return;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = ctx.currentTime + when;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(sfx);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  const arp = (notes, gap, type = "square", vol = 0.14, dur = 0.14) => notes.forEach((n, i) => tone(n, dur, type, vol, i * gap));
  const SOUNDS = {
    count: () => tone(587, 0.2, "square", 0.16),
    go: () => { tone(1175, 0.5, "square", 0.16); tone(1760, 0.5, "triangle", 0.08); },
    box: () => arp([880, 1109, 1319, 1760], 0.045, "triangle", 0.1, 0.1),
    gotitem: () => tone(1319, 0.12, "triangle", 0.1),
    cones: () => arp([784, 659, 523], 0.07, "square", 0.12, 0.09),
    paint: () => { noise(0.45, 0.22, 900, 0, 260, 1.2); tone(330, 0.3, "sine", 0.08, 0, 180); },
    hardhat: () => arp([523, 659, 784, 1047, 1319], 0.05, "triangle", 0.12, 0.16),
    horn: () => { tone(311, 0.55, "sawtooth", 0.12); tone(392, 0.55, "sawtooth", 0.1); tone(466, 0.55, "square", 0.05); },
    tow: () => tone(220, 0.35, "sawtooth", 0.12, 0, 880),
    flatbed: () => { noise(0.8, 0.18, 400, 0, 3200, 0.7); tone(196, 0.8, "sawtooth", 0.08, 0, 784); },
    pad: () => tone(440, 0.28, "square", 0.08, 0, 1320),
    miniboost: () => { tone(660, 0.16, "square", 0.1, 0, 1320); noise(0.25, 0.12, 2000, 0, 4000); },
    drift: () => noise(0.18, 0.08, 2600, 0, 1800, 2),
    hit: () => { noise(0.35, 0.3, 500, 0, 120, 1); tone(180, 0.3, "square", 0.1, 0, 70); },
    wall: () => noise(0.18, 0.2, 260, 0, 90, 1.2),
    bump: () => noise(0.12, 0.14, 400, 0, 150, 1.2),
    cone: () => tone(1500, 0.08, "triangle", 0.08),
    shield: () => arp([1319, 988], 0.06, "triangle", 0.12),
    lap: () => arp([988, 1319], 0.1, "triangle", 0.14, 0.2),
    finallap: () => arp([659, 784, 988, 1319, 988, 1319], 0.085, "square", 0.12, 0.12),
    finish: () => { arp([523, 659, 784, 1047], 0.12, "square", 0.13, 0.22); arp([262, 330, 392, 523], 0.12, "triangle", 0.1, 0.3); tone(1047, 0.9, "triangle", 0.12, 0.5); },
    safety: () => arp([1568, 1976], 0.09, "sine", 0.16, 0.22),
    signal: () => tone(1200, 0.04, "square", 0.05),
    startboost: () => tone(523, 0.4, "square", 0.1, 0, 1568),
    select: () => tone(880, 0.06, "triangle", 0.1),
    unlock: () => arp([523, 659, 784, 1047, 1319, 1568], 0.08, "triangle", 0.14, 0.25),
  };

  function engine(i, frac, boost, on = true) {
    if (!ensure()) return;
    let e = engines[i];
    if (!e) {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o1.type = "sawtooth"; o2.type = "square"; f.type = "lowpass"; f.frequency.value = 700; g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfx);
      o1.start(); o2.start();
      e = engines[i] = { o1, o2, f, g };
    }
    const t = ctx.currentTime;
    const base = 48 + frac * 120 + (boost ? 26 : 0);
    e.o1.frequency.setTargetAtTime(base, t, 0.06);
    e.o2.frequency.setTargetAtTime(base * 0.502, t, 0.06);
    e.f.frequency.setTargetAtTime(420 + frac * 1500 + (boost ? 600 : 0), t, 0.08);
    const n = Math.max(1, engines.filter(Boolean).length);
    e.g.gain.setTargetAtTime(on && !muted ? (0.05 + frac * 0.035) / Math.sqrt(n) : 0, t, 0.08);
  }

  function stopEngines() {
    for (const e of engines) if (e && ctx) e.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }

  // The backing loop: A – E – F#m – D, eighth notes at 132 bpm.
  const CHORDS = [[110, 220, 277, 330], [82.4, 165, 208, 247], [92.5, 185, 220, 277], [73.4, 147, 185, 220]];
  const LEAD = [0, 2, 1, 3, 2, 1, 3, 2];
  function schedule() {
    if (!ctx || !musicOn || muted) return;
    const e8 = 60 / 132 / 2;
    while (nextAt < ctx.currentTime + 0.2) {
      const bar = Math.floor(step / 8) % 4, beat = step % 8;
      const ch = CHORDS[bar];
      const when = nextAt - ctx.currentTime;
      if (beat % 2 === 0) tone(ch[0], e8 * 1.6, "triangle", 0.5, Math.max(0, when), null, bus);
      tone(ch[1 + (LEAD[beat] % 3)] * 2, e8 * 0.9, "square", 0.16, Math.max(0, when), null, bus);
      if (beat === 4) tone(ch[3] * 4, e8 * 1.8, "triangle", 0.12, Math.max(0, when), null, bus);
      step += 1; nextAt += e8;
    }
  }

  return {
    resume() { if (ensure()) { ctx.resume?.(); } },
    play(name) { SOUNDS[name]?.(); },
    engine, stopEngines,
    setMuted(m) { muted = !!m; if (muted) stopEngines(); },
    get muted() { return muted; },
    music(on) {
      musicOn = !!on;
      if (!ensure()) return;
      if (musicOn && !musicTimer) { nextAt = ctx.currentTime + 0.1; musicTimer = setInterval(schedule, 60); }
      if (!musicOn && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    },
    get musicOn() { return musicOn; },
  };
}
