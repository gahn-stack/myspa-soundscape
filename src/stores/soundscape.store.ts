import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TRACK_INDEX_ORDER } from '@/audio/tracks';
import { decodeSoundscapeState, encodeSoundscapeState } from '@/utils/encoding';

export const useSoundscapeStore = defineStore('soundscape', () => {
  const masterVolume = ref<number>(0.5);
  const trackVolumes = ref<Record<string, number>>({});
  const activeTrackIds = ref<string[]>([]);
  const isPlaying = ref<boolean>(false);
  const errorTrackIds = ref<string[]>([]);
  const activeMixId = ref<string | null>(null);

  const activeTrackCount = computed(() => activeTrackIds.value.length);

  function isActive(trackId: string): boolean {
    return activeTrackIds.value.includes(trackId);
  }

  function hasError(trackId: string): boolean {
    return errorTrackIds.value.includes(trackId);
  }

  function setTrackVolume(trackId: string, volume: number): void {
    trackVolumes.value = { ...trackVolumes.value, [trackId]: volume };
  }

  function setMasterVolume(volume: number): void {
    masterVolume.value = volume;
  }

  function setActive(trackId: string, active: boolean): void {
    if (active) {
      if (!activeTrackIds.value.includes(trackId)) {
        activeTrackIds.value = [...activeTrackIds.value, trackId];
      }
      errorTrackIds.value = errorTrackIds.value.filter((id) => id !== trackId);
    } else {
      activeTrackIds.value = activeTrackIds.value.filter((id) => id !== trackId);
    }
    isPlaying.value = activeTrackIds.value.length > 0;
  }

  function setError(trackId: string): void {
    errorTrackIds.value = [...errorTrackIds.value, trackId];
    activeTrackIds.value = activeTrackIds.value.filter((id) => id !== trackId);
    isPlaying.value = activeTrackIds.value.length > 0;
  }

  function stopAll(): void {
    activeTrackIds.value = [];
    isPlaying.value = false;
  }

  function resetToDefaults(): void {
    masterVolume.value = 0.5;
    trackVolumes.value = {};
    activeTrackIds.value = [];
    isPlaying.value = false;
    errorTrackIds.value = [];
    activeMixId.value = null;
  }

  function toUrlParams(): string {
    return encodeSoundscapeState(masterVolume.value, trackVolumes.value, TRACK_INDEX_ORDER);
  }

  function fromUrlParams(searchParams: URLSearchParams): boolean {
    const decoded = decodeSoundscapeState(searchParams, TRACK_INDEX_ORDER);
    if (!decoded) return false;
    masterVolume.value = decoded.masterVolume;
    trackVolumes.value = decoded.trackVolumes;
    activeTrackIds.value = Object.entries(decoded.trackVolumes)
      .filter(([, v]) => v > 0)
      .map(([id]) => id);
    isPlaying.value = activeTrackIds.value.length > 0;
    return true;
  }

  function applyMix(trackVolumesMap: Record<string, number>, master: number): void {
    trackVolumes.value = { ...trackVolumesMap };
    masterVolume.value = master;
    activeTrackIds.value = Object.entries(trackVolumesMap)
      .filter(([, v]) => v > 0)
      .map(([id]) => id);
    isPlaying.value = activeTrackIds.value.length > 0;
  }

  function setActiveMix(mixId: string | null): void {
    activeMixId.value = mixId;
  }

  return {
    masterVolume,
    trackVolumes,
    activeTrackIds,
    isPlaying,
    activeTrackCount,
    errorTrackIds,
    activeMixId,
    isActive,
    hasError,
    setTrackVolume,
    setMasterVolume,
    setActive,
    setError,
    stopAll,
    resetToDefaults,
    toUrlParams,
    fromUrlParams,
    applyMix,
    setActiveMix,
  };
});
