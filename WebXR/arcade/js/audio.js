// Break Room Arcade — sound.
//
// Everything is synthesised on the spot with WebAudio: short chiptune-style
// effects for menus and in-game events, plus a quiet looping backing track
// written for this game (a four-bar square/triangle arpeggio over a
// triangle bass). No sample files, nothing borrowed. Browsers only start
// audio after a user gesture, so nothing sounds until resume() is called
// from one — same contract as WebXR/race/js/audio.js.

export function arCreateAudio() {
  let ctx = null, master = null, sfx = null, bus = null, muted = false, musicOn = true;
  let musicTimer = null, step = 0;

  function ensure() {
    if (ctx) return ctx;
    const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
    master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    bus = ctx.createGain(); bus.gain.value = 0.14; bus.connect(master);
    return ctx;
  }

  function tone(freq, dur, type = "square", vol = 0.16, when = 0, slideTo = null, out = null) {
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
  function noise(dur, vol = 0.2, freq = 1200, when = 0, sweepTo = null, q = 0.9) {
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

  const arp = (notes, gap, type = "square", vol = 0.14, dur = 0.13) =>
    notes.forEach((n, i) => tone(n, dur, type, vol, i * gap));

  const SOUNDS = {
    select: () => tone(660, 0.08, "square", 0.12),
    start: () => arp([523, 659, 784, 1047], 0.06, "triangle", 0.14, 0.14),
    pause: () => tone(392, 0.14, "triangle", 0.12),
    jump: () => tone(440, 0.14, "square", 0.12, 0, 880),
    land: () => noise(0.08, 0.1, 300, 0, 150),
    step: () => tone(220, 0.03, "square", 0.03),
    coin: () => arp([988, 1319], 0.05, "triangle", 0.12, 0.09),
    ppe: () => arp([784, 988, 1319], 0.05, "triangle", 0.13, 0.1),
    anchor: () => arp([659, 880, 1109], 0.06, "triangle", 0.14, 0.13),
    stomp: () => { tone(200, 0.1, "square", 0.14, 0, 90); noise(0.08, 0.12, 400); },
    hit: () => { noise(0.28, 0.26, 500, 0, 120, 1); tone(150, 0.25, "square", 0.1, 0, 60); },
    ship: () => arp([523, 659, 784, 988, 1319], 0.05, "square", 0.12, 0.11),
    tetris: () => arp([523, 659, 784, 1047, 1319, 1568], 0.045, "triangle", 0.14, 0.12),
    shift: () => noise(0.3, 0.18, 220, 0, 90, 1.4),
    levelup: () => arp([440, 554, 659, 880], 0.07, "square", 0.13, 0.14),
    checkpoint: () => arp([784, 659, 880, 1175], 0.08, "triangle", 0.14, 0.16),
    win: () => arp([659, 784, 988, 1319, 1568, 1976], 0.09, "triangle", 0.16, 0.2),
    over: () => arp([392, 330, 262, 196], 0.14, "sawtooth", 0.14, 0.22),
    highscore: () => arp([659, 880, 1109, 1319, 1760], 0.07, "square", 0.15, 0.14),
  };

  function play(name) { SOUNDS[name]?.(); }

  // A four-bar chiptune loop: a triangle bass walking a simple I–vi–IV–V,
  // with a square arpeggio riding on top. Original to this game.
  const BASS = [196, 220, 175, 147];
  const ARPS = [[392, 494, 587], [440, 523, 659], [349, 440, 523], [294, 370, 440]];
  function musicStep() {
    if (!ctx || muted || !musicOn) return;
    const bar = step % 4;
    tone(BASS[bar], 0.85, "triangle", 0.1, 0, null, bus);
    ARPS[bar].forEach((n, i) => tone(n, 0.18, "square", 0.05, i * 0.2, null, bus));
    step += 1;
  }
  function music(on) {
    musicOn = on;
    clearInterval(musicTimer);
    if (on) { ensure(); musicStep(); musicTimer = setInterval(musicStep, 900); }
  }

  return {
    resume() { const c = ensure(); if (c?.state === "suspended") c.resume().catch(() => {}); },
    play,
    music,
    setMuted(v) { muted = v; if (v) clearInterval(musicTimer); else if (musicOn) music(true); },
    get muted() { return muted; },
    stop() { clearInterval(musicTimer); musicTimer = null; },
  };
}
