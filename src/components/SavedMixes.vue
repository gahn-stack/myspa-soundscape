<script setup lang="ts">
import { computed, ref } from 'vue';
import { TRACKS } from '@/audio/tracks';
import { useAudioEngine } from '@/composables/useAudioEngine';
import type { SavedMix } from '@/models/types';
import SectionHelpModal from '@/components/SectionHelpModal.vue';
import { useLibraryStore } from '@/stores/library.store';
import { useSoundscapeStore } from '@/stores/soundscape.store';

const soundscapeStore = useSoundscapeStore();
const libraryStore = useLibraryStore();
const audioInitialized = ref(false);
const { playMix } = useAudioEngine(audioInitialized);

const isExpanded = ref(false);
const mixName = ref('');
const showNameInput = ref(false);

libraryStore.loadFromDisk();

const mixes = computed(() => libraryStore.mixes);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function startSave() {
  showNameInput.value = true;
  mixName.value = '';
}

function confirmSave() {
  if (!mixName.value.trim()) return;
  const activeOnly: Record<string, number> = {};
  for (const trackId of soundscapeStore.activeTrackIds) {
    const vol = soundscapeStore.trackVolumes[trackId];
    if (vol !== undefined && vol > 0) {
      activeOnly[trackId] = vol;
    }
  }
  libraryStore.addMix(mixName.value.trim(), activeOnly, soundscapeStore.masterVolume);
  mixName.value = '';
  showNameInput.value = false;
}

function cancelSave() {
  showNameInput.value = false;
  mixName.value = '';
}

function loadMix(mix: SavedMix) {
  soundscapeStore.setActiveMix(mix.id);
  playMix(mix.trackVolumes, mix.masterVolume);
}

function deleteMix(id: string) {
  if (soundscapeStore.activeMixId === id) {
    soundscapeStore.setActiveMix(null);
  }
  libraryStore.deleteMix(id);
}

function getTrackIcon(trackId: string): string {
  return TRACKS.find((t) => t.id === trackId)?.icon ?? '';
}

function getActiveTrackIds(mix: SavedMix): string[] {
  return Object.entries(mix.trackVolumes)
    .filter(([, v]) => v > 0)
    .map(([id]) => id);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('de-DE');
}
</script>

<template>
  <div class="rounded-xl bg-myspa-turquoise">
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-2">
        <span class="font-overpass-semibold text-myspa-blue">{{$t('mixes.title')}}</span>
        <SectionHelpModal title-key="mixes.guideTitle" text-key="mixes.guideText" />
      </div>
      <button @click="toggleExpand">
        <svg
          class="h-5 w-5 text-myspa-blue transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>

    <div class="px-4 pb-4">
      <div v-if="showNameInput" class="mb-3 flex gap-2">
        <input
          v-model="mixName"
          type="text"
          :placeholder="$t('mixes.namePlaceholder')"
          class="flex-1 rounded-lg border border-myspa-blue/30 px-3 py-2 font-overpass text-sm text-myspa-blue placeholder-myspa-blue/50 outline-none focus:border-myspa-turquoise-dark"
          @keyup.enter="confirmSave"
        />
        <button
          class="flex items-center justify-center rounded-lg bg-myspa-blue px-3 py-2 text-white transition-colors duration-200 hover:bg-myspa-blue-alt"
          @click="confirmSave"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 12 10 18 20 6" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center rounded-lg bg-myspa-error px-3 py-2 text-white transition-colors duration-200 hover:opacity-80"
          @click="cancelSave"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>
      <button
        v-else
        class="mb-3 w-full rounded-full bg-myspa-blue px-4 py-2 font-overpass text-sm text-white transition-colors duration-200 hover:bg-myspa-blue-alt"
        @click="startSave"
      >
        {{$t('mixes.save')}}
      </button>
    </div>

    <Transition name="collapse">
      <div v-if="isExpanded" class="px-4 pb-4">
        <div v-if="mixes.length === 0"         class="py-4 text-center font-overpass text-sm text-myspa-blue/60">
          {{$t('mixes.empty')}}
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="mix in mixes"
            :key="mix.id"
            class="flex items-center justify-between rounded-lg bg-white p-3"
          >
            <div class="flex flex-col gap-1">
              <span class="font-overpass-semibold text-sm text-myspa-blue">{{ mix.name }}</span>
              <span class="font-overpass text-xs text-myspa-disabled-grey">{{ formatDate(mix.createdAt) }}</span>
              <div class="flex gap-1">
                <img
                  v-for="trackId in getActiveTrackIds(mix)"
                  :key="trackId"
                  :src="getTrackIcon(trackId)"
                  :alt="trackId"
                  class="inline-block h-4 w-4"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="font-overpass text-xs text-myspa-turquoise-dark hover:text-myspa-blue"
                @click="loadMix(mix)"
              >
                {{$t('mixes.load')}}
              </button>
              <button
                class="font-overpass text-xs text-myspa-error hover:text-myspa-blue"
                @click="deleteMix(mix.id)"
              >
                {{$t('mixes.delete')}}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
