// Audio synthesizer using Web Audio API for tactile mechanical typing clicks,
// message send swooshes, streaming ticks, and reaction chimes.
// No external MP3 files required — 100% offline, zero latency, zero 404s.

let audioCtx: AudioContext | null = null;
let isSoundEnabled = true;

// Initialize sound preference from localStorage
try {
  const saved = localStorage.getItem('mrtech_typing_sound');
  if (saved !== null) {
    isSoundEnabled = saved === 'true';
  }
} catch {
  // ignore
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isTypingSoundEnabled(): boolean {
  return isSoundEnabled;
}

export function setTypingSoundEnabled(enabled: boolean): void {
  isSoundEnabled = enabled;
  try {
    localStorage.setItem('mrtech_typing_sound', enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Play subtle mechanical keyboard click when user types
 */
let lastKeySoundTime = 0;
export function playTypingClick(): void {
  if (!isSoundEnabled) return;

  const now = performance.now();
  // Throttle very rapid key repeat to avoid audio crackle (min 45ms between clicks)
  if (now - lastKeySoundTime < 45) return;
  lastKeySoundTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Transient click oscillator (pitch randomized slightly for natural feel)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 950 + Math.random() * 350; // 950Hz - 1300Hz mechanical keycap click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.025);

    // 2. High-pass filter for crisp snap
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);

    // Envelope
    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  } catch {
    // AudioContext might be blocked until user interaction
  }
}

/**
 * Play subtle soft click for incoming AI streaming tokens (cadence of AI thinking/typing)
 */
let lastStreamTick = 0;
export function playStreamTick(): void {
  if (!isSoundEnabled) return;

  const now = performance.now();
  // Throttle streaming clicks to 120ms so it creates a pleasant typewriter rhythm
  if (now - lastStreamTick < 120) return;
  lastStreamTick = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const freq = 1400 + Math.random() * 200;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.02);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.025);
  } catch {
    // ignore
  }
}

/**
 * Play smooth pop/chime on message send
 */
export function playSendSound(): void {
  if (!isSoundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  } catch {
    // ignore
  }
}

/**
 * Play subtle pop/chime on reaction or bookmark
 */
export function playReactionSound(isBookmark = false): void {
  if (!isSoundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (isBookmark) {
      // Golden bookmark chime
      osc.frequency.setValueAtTime(659.25, t); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, t + 0.12); // B5
    } else {
      // Friendly pop
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.08); // G5
    }

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  } catch {
    // ignore
  }
}
