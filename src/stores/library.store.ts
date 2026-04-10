import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SavedMix } from '@/models/types';
import { generateId, loadFromStorage, removeFromStorage, saveToStorage } from '@/utils/storage';

const STORAGE_KEY = 'myspa-soundscape-mixes';
const MAX_MIXES = 200;

export const useLibraryStore = defineStore('library', () => {
  const mixes = ref<SavedMix[]>([]);

  function loadFromDisk(): void {
    mixes.value = loadFromStorage<SavedMix[]>(STORAGE_KEY, []);
  }

  function persist(): void {
    saveToStorage(STORAGE_KEY, mixes.value);
  }

  function addMix(
    name: string,
    trackVolumes: Record<string, number>,
    masterVolume: number,
  ): SavedMix | null {
    if (mixes.value.length >= MAX_MIXES) return null;
    const mix: SavedMix = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      trackVolumes: { ...trackVolumes },
      masterVolume,
    };
    mixes.value.unshift(mix);
    persist();
    return mix;
  }

  function updateMix(
    id: string,
    trackVolumes: Record<string, number>,
    masterVolume: number,
  ): void {
    const mix = mixes.value.find((m) => m.id === id);
    if (!mix) return;
    mix.trackVolumes = { ...trackVolumes };
    mix.masterVolume = masterVolume;
    persist();
  }

  function deleteMix(id: string): void {
    mixes.value = mixes.value.filter((m) => m.id !== id);
    persist();
  }

  function getMix(id: string): SavedMix | undefined {
    return mixes.value.find((m) => m.id === id);
  }

  function clearAll(): void {
    mixes.value = [];
    removeFromStorage(STORAGE_KEY);
  }

  return { mixes, loadFromDisk, addMix, updateMix, deleteMix, getMix, clearAll };
});
