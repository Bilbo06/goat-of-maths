let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let _enabled = true;

export function isSoundEnabled(): boolean {
  return _enabled;
}

export function setSoundEnabled(v: boolean) {
  _enabled = v;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!_enabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration: number, volume = 0.08) {
  if (!_enabled) return;
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + duration);
  } catch {}
}

export function playCorrect() {
  playTone(523.25, 0.12, 'sine', 0.18);
  setTimeout(() => playTone(659.25, 0.12, 'sine', 0.18), 80);
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.18), 160);
}

export function playWrong() {
  playTone(200, 0.3, 'sawtooth', 0.1);
  setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.08), 150);
}

export function playHit() {
  playNoise(0.08, 0.12);
  playTone(120, 0.1, 'square', 0.08);
}

export function playDefend() {
  playTone(300, 0.12, 'triangle', 0.1);
  setTimeout(() => playTone(400, 0.15, 'triangle', 0.1), 60);
}

export function playHeal() {
  playTone(440, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(554.37, 0.1, 'sine', 0.12), 80);
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 160);
}

export function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.2, 'sine', 0.2), i * 120);
  });
}

export function playDefeat() {
  playTone(400, 0.25, 'sawtooth', 0.1);
  setTimeout(() => playTone(350, 0.25, 'sawtooth', 0.1), 200);
  setTimeout(() => playTone(280, 0.5, 'sawtooth', 0.1), 400);
}

export function playPurchase() {
  playTone(880, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(1108.73, 0.08, 'sine', 0.12), 60);
  setTimeout(() => playTone(1318.51, 0.15, 'sine', 0.12), 120);
  playNoise(0.04, 0.06);
}

export function playLevelUp() {
  const notes = [523.25, 659.25, 783.99, 880, 1046.5, 1318.51];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.18, 'sine', 0.15), i * 80);
  });
}

export function playBadgeUnlock() {
  playTone(698.46, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.15), 100);
  setTimeout(() => playTone(1046.5, 0.15, 'sine', 0.15), 200);
  setTimeout(() => playTone(1318.51, 0.25, 'sine', 0.18), 300);
}

export function playClick() {
  playTone(800, 0.04, 'sine', 0.06);
}

export function playTimer() {
  playTone(600, 0.05, 'sine', 0.04);
}
