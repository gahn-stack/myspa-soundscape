import type { Ref } from 'vue';
import { watch } from 'vue';
import { audioEngine } from '@/audio/engine';
import { TRACKS } from '@/audio/tracks';
import { useAudioSourceStore } from '@/stores/audio-source.store';
import { useLibraryStore } from '@/stores/library.store';
import { useSoundscapeStore } from '@/stores/soundscape.store';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const SESSION_KEY = 'myspa-soundscape-session';

export function useAudioEngine(isInitialized: Ref<boolean>) {
  const store = useSoundscapeStore();
  const sourceStore = useAudioSourceStore();
  const libraryStore = useLibraryStore();

  function resolveUrl(trackId: string): string | undefined {
    const track = TRACKS.find((t) => t.id === trackId);
    return sourceStore.resolveAssetPath(trackId, track?.assetPath ?? '');
  }

  async function init(): Promise<void> {
    await audioEngine.init();
    isInitialized.value = true;
    const coreTracks = TRACKS.filter((t) => t.core);
    for (const track of coreTracks) {
      try {
        await audioEngine.loadTrack(track.id, resolveUrl(track.id));
      } catch {
      }
    }
  }

  async function toggleTrackPlayback(trackId: string): Promise<void> {
    if (!audioEngine.isInitialized) return;

    if (audioEngine.isTrackPlaying(trackId)) {
      audioEngine.stopTrack(trackId);
      store.setActive(trackId, false);
      return;
    }

    try {
      await audioEngine.loadTrack(trackId, resolveUrl(trackId));
      const volume = store.trackVolumes[trackId] ?? 0.5;
      store.setTrackVolume(trackId, volume);
      audioEngine.setTrackVolume(trackId, volume);
      audioEngine.playTrack(trackId);
      store.setActive(trackId, true);
    } catch {
      store.setError(trackId);
    }
  }

  async function playMix(
    trackVolumes: Record<string, number>,
    masterVolume: number,
  ): Promise<void> {
    if (!audioEngine.isInitialized) {
      store.applyMix(trackVolumes, masterVolume);
      return;
    }

    audioEngine.stopAll();
    store.applyMix(trackVolumes, masterVolume);
    audioEngine.setMasterVolume(masterVolume);

    const activeIds = Object.entries(trackVolumes)
      .filter(([, v]) => v > 0)
      .map(([id]) => id);

    for (const trackId of activeIds) {
      try {
        await audioEngine.loadTrack(trackId, resolveUrl(trackId));
        audioEngine.setTrackVolume(trackId, trackVolumes[trackId]);
        audioEngine.playTrack(trackId);
      } catch {
        store.setError(trackId);
      }
    }
  }

  function updateTrackVolume(trackId: string, volume: number): void {
    store.setTrackVolume(trackId, volume);
    if (audioEngine.isInitialized && audioEngine.isTrackPlaying(trackId)) {
      audioEngine.setTrackVolume(trackId, volume);
    }
  }

  function updateMasterVolume(volume: number): void {
    store.setMasterVolume(volume);
    if (audioEngine.isInitialized) {
      audioEngine.setMasterVolume(volume);
    }
  }

  function stopAll(): void {
    if (audioEngine.isInitialized) {
      audioEngine.stopAll();
    }
    store.stopAll();
  }

  function persistSession(): void {
    const activeOnly: Record<string, number> = {};
    for (const trackId of store.activeTrackIds) {
      const vol = store.trackVolumes[trackId];
      if (vol !== undefined && vol > 0) {
        activeOnly[trackId] = vol;
      }
    }
    saveToStorage(SESSION_KEY, {
      trackVolumes: activeOnly,
      masterVolume: store.masterVolume,
    });

    if (store.activeMixId) {
      libraryStore.updateMix(store.activeMixId, activeOnly, store.masterVolume);
    }
  }

  function restoreSession(): Record<string, number> | null {
    const session = loadFromStorage<{
      trackVolumes: Record<string, number>;
      masterVolume: number;
    } | null>(SESSION_KEY, null);
    return session?.trackVolumes && Object.keys(session.trackVolumes).length > 0
      ? session.trackVolumes
      : null;
  }

  function getRestoredMasterVolume(): number {
    const session = loadFromStorage<{
      trackVolumes: Record<string, number>;
      masterVolume: number;
    } | null>(SESSION_KEY, null);
    return session?.masterVolume ?? 0.5;
  }

  watch(
    () => [store.activeTrackIds, store.trackVolumes, store.masterVolume] as const,
    () => persistSession(),
    { deep: true },
  );

  return {
    init,
    toggleTrackPlayback,
    playMix,
    updateTrackVolume,
    updateMasterVolume,
    stopAll,
    restoreSession,
    getRestoredMasterVolume,
    invalidateTrack: audioEngine.invalidateTrack.bind(audioEngine),
  };
}
