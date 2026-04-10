class SleepTimerControllerImpl {
  private endTime: number | null = null;
  private previousVolume = 1;
  private endTimeout: ReturnType<typeof setTimeout> | null = null;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;
  private active = false;

  start(durationMinutes: number, masterGain: GainNode, onExpire: () => void): void {
    this.cancel(masterGain, this.previousVolume);

    this.previousVolume = masterGain.gain.value;
    const totalSeconds = durationMinutes * 60;
    this.endTime = Date.now() + totalSeconds * 1000;
    this.active = true;

    if (totalSeconds > 30) {
      this.fadeTimeout = setTimeout(
        () => {
          if (!this.active || !this.endTime) return;
          const audioCtx = masterGain.context as AudioContext;
          masterGain.gain.setValueAtTime(this.previousVolume, audioCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 30);
        },
        (totalSeconds - 30) * 1000,
      );
    } else {
      const audioCtx = masterGain.context as AudioContext;
      masterGain.gain.setValueAtTime(this.previousVolume, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + totalSeconds);
    }

    this.endTimeout = setTimeout(() => {
      this.active = false;
      this.endTime = null;
      onExpire();
    }, totalSeconds * 1000);
  }

  cancel(masterGain: GainNode, previousVolume: number): void {
    if (this.endTimeout) clearTimeout(this.endTimeout);
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
    this.endTimeout = null;
    this.fadeTimeout = null;

    if (this.active) {
      const audioCtx = masterGain.context as AudioContext;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(previousVolume, audioCtx.currentTime);
    }

    this.active = false;
    this.endTime = null;
  }

  get isActive(): boolean {
    return this.active;
  }

  get remainingSeconds(): number {
    if (!this.active || !this.endTime) return 0;
    return Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
  }
}

export const sleepTimer = new SleepTimerControllerImpl();
