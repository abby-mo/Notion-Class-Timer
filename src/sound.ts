let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Soft two-tone chime when a quota is reached. */
export async function playCompletionSound(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    playTone(ctx, 784, now, 0.18, 0.08);
    playTone(ctx, 1046.5, now + 0.16, 0.28, 0.07);
  } catch {
    // Autoplay / AudioContext may be blocked until a user gesture.
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gainValue: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}
