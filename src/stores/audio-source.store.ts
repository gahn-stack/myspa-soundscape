import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AudioSource } from '@/models/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const STORAGE_KEY = 'myspa-soundscape-audio-sources';

export const useAudioSourceStore = defineStore('audioSource', () => {
  const customSources = ref<Record<string, AudioSource>>({});

  function loadFromDisk(): void {
    customSources.value = loadFromStorage<Record<string, AudioSource>>(STORAGE_KEY, {});
  }

  function persist(): void {
    const serializable: Record<string, AudioSource> = {};
    for (const [trackId, source] of Object.entries(customSources.value)) {
      if (source.type === 'file') {
        serializable[trackId] = { type: 'file', label: source.label };
      } else {
        serializable[trackId] = { ...source };
      }
    }
    saveToStorage(STORAGE_KEY, serializable);
  }

  function setSource(trackId: string, source: AudioSource): void {
    customSources.value[trackId] = source;
    persist();
  }

  function resetToDefault(trackId: string): void {
    delete customSources.value[trackId];
    customSources.value = { ...customSources.value };
    persist();
  }

  function getSource(trackId: string): AudioSource | undefined {
    return customSources.value[trackId];
  }

  function resolveAssetPath(trackId: string, defaultPath: string): string {
    const source = customSources.value[trackId];
    if (!source) return defaultPath;
    if (source.type === 'file' && source.objectUrl) return source.objectUrl;
    return defaultPath;
  }

  loadFromDisk();

  return { customSources, setSource, resetToDefault, getSource, resolveAssetPath, loadFromDisk };
});
