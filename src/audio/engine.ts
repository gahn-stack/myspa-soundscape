import { TRACKS } from './tracks';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGainNodes = new Map<string, GainNode>();
  private trackSources = new Map<string, AudioBufferSourceNode>();
  private audioBuffers = new Map<string, AudioBuffer>();

  async init(): Promise<void> {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    await this.audioContext.resume();
  }

  async loadTrack(trackId: string, customUrl?: string): Promise<AudioBuffer> {
    const cached = this.audioBuffers.get(trackId);
    if (cached) return cached;

    const url = customUrl ?? TRACKS.find((t) => t.id === trackId)?.assetPath;
    if (!url) throw new Error(`Track not found: ${trackId}`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.decodeAudioData(arrayBuffer);
    this.audioBuffers.set(trackId, buffer);
    return buffer;
  }

  invalidateTrack(trackId: string): void {
    this.stopTrack(trackId);
    this.audioBuffers.delete(trackId);
  }

  private decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        reject(new Error('AudioContext not initialized'));
        return;
      }
      try {
        const result = this.audioContext.decodeAudioData(arrayBuffer, resolve, reject);
        if (result instanceof Promise) {
          result.then(resolve).catch(reject);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  playTrack(trackId: string): void {
    const buffer = this.audioBuffers.get(trackId);
    if (!buffer || !this.audioContext || !this.masterGain) {
      throw new Error(`Cannot play track ${trackId}: not initialized or buffer missing`);
    }

    this.stopTrack(trackId);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    let gainNode = this.trackGainNodes.get(trackId);
    if (!gainNode) {
      gainNode = this.audioContext.createGain();
      gainNode.connect(this.masterGain);
      this.trackGainNodes.set(trackId, gainNode);
    }

    const targetVolume = gainNode.gain.value;
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + 3);

    source.connect(gainNode);
    source.start();
    this.trackSources.set(trackId, source);
  }

  stopTrack(trackId: string): void {
    const source = this.trackSources.get(trackId);
    if (source) {
      try {
        source.stop();
      } catch {
        // Source may already be stopped
      }
      this.trackSources.delete(trackId);
    }
  }

  setTrackVolume(trackId: string, volume: number): void {
    if (!this.audioContext) return;
    let gainNode = this.trackGainNodes.get(trackId);
    if (!gainNode) {
      gainNode = this.audioContext.createGain();
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      }
      this.trackGainNodes.set(trackId, gainNode);
    }
    gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.05);
  }

  isTrackPlaying(trackId: string): boolean {
    return this.trackSources.has(trackId);
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain || !this.audioContext) return;
    this.masterGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.05);
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 1;
  }

  stopAll(): void {
    for (const trackId of this.trackSources.keys()) {
      this.stopTrack(trackId);
    }
  }

  getMasterGainNode(): GainNode | null {
    return this.masterGain;
  }

  get isInitialized(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }

  get isContextSuspended(): boolean {
    return this.audioContext?.state === 'suspended';
  }
}

export const audioEngine = new AudioEngine();
