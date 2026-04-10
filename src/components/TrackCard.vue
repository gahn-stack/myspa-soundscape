<script setup lang="ts">
import { ref } from 'vue';
import type { TrackDefinition } from '@/audio/tracks';
import AudioSourcePicker from '@/components/AudioSourcePicker.vue';
import { useAudioSourceStore } from '@/stores/audio-source.store';

defineProps<{
  track: TrackDefinition;
  volume: number;
  isActive: boolean;
  isLoading: boolean;
  hasError: boolean;
}>();

const emit = defineEmits<{
  toggle: [trackId: string];
  'volume-change': [trackId: string, volume: number];
  'source-changed': [trackId: string];
}>();

const sourceStore = useAudioSourceStore();
const showSourcePicker = ref(false);

function handleSourceChanged(trackId: string) {
  showSourcePicker.value = false;
  emit('source-changed', trackId);
}
</script>

<template>
  <div class="group flex flex-col items-center gap-3 rounded-xl p-4">
    <div class="relative">
      <div
        class="transition-all duration-300"
        :class="{
          'scale-95 opacity-40': !isActive && !isLoading && !hasError,
          'scale-100 opacity-100': isActive || isLoading,
        }"
      >
        <button
          class="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
          :class="{
            'shadow-lg shadow-myspa-blue-alt/30': isActive,
            'ring-2 ring-myspa-error shadow-lg shadow-myspa-error/20': hasError,
            'ring-1 ring-myspa-blue-shade/40 hover:ring-myspa-blue/60': !isActive && !hasError,
          }"
          :style="{ backgroundColor: isActive ? 'var(--color-myspa-blue-alt)' : 'transparent' }"
          @click="$emit('toggle', track.id)"
        >
          <img
            :src="track.icon"
            :alt="$t(track.label)"
            class="h-10 w-10 transition-all duration-300"
            :class="{
              'brightness-0 invert': isActive,
              'text-myspa-blue': !isActive,
            }"
          />
          <span
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center rounded-full bg-myspa-blue/50"
          >
            <span class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        </button>
      </div>
      <button
        class="absolute -right-1 -bottom-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-myspa-disabled-grey shadow-sm ring-1 ring-myspa-blue-shade/30 transition-colors duration-200 hover:bg-myspa-blue-light hover:text-myspa-blue"
        :class="{ 'text-myspa-turquoise-dark ring-myspa-turquoise-dark/40': sourceStore.getSource(track.id) }"
        @click="showSourcePicker = !showSourcePicker"
      >
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <AudioSourcePicker
        v-if="showSourcePicker"
        :track-id="track.id"
        @close="showSourcePicker = false"
        @changed="handleSourceChanged"
      />
    </div>

    <span class="font-overpass text-sm text-myspa-blue" :class="{ 'font-semibold': isActive }">{{$t(track.label)}}</span>

    <div
      v-if="hasError"
      class="flex w-full items-center gap-1.5 rounded-lg bg-myspa-error/10 px-2 py-1.5"
    >
      <svg class="h-3.5 w-3.5 shrink-0 text-myspa-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span class="font-overpass text-[11px] leading-tight text-myspa-error">
        {{$t('tracks.errorLoad')}}
      </span>
    </div>

    <div class="flex w-full flex-col gap-1">
      <input
        type="range"
        :value="volume"
        :disabled="!isActive"
        min="0"
        max="100"
        step="1"
        class="range-slider w-full"
        :class="{ 'range-slider--active': isActive }"
        :style="{
          '--value-percent': `${volume}%`,
        }"
        @input="
          $emit('volume-change', track.id, ($event.target as HTMLInputElement).valueAsNumber)
        "
      />
    </div>
  </div>
</template>

<style scoped>
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(186, 225, 232, 0.3);
  outline: none;
  opacity: 0.4;
  transition: opacity 0.3s ease;
  touch-action: none;
}

.range-slider--active {
  opacity: 1;
  background: linear-gradient(
    to right,
    var(--color-myspa-turquoise) 0%,
    var(--color-myspa-turquoise) var(--value-percent, 50%),
    rgba(186, 225, 232, 0.3) var(--value-percent, 50%),
    rgba(186, 225, 232, 0.3) 100%
  );
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-myspa-turquoise);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.range-slider--active::-webkit-slider-thumb {
  background: var(--color-myspa-turquoise);
  box-shadow: 0 0 0 3px rgba(186, 225, 232, 0.2);
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.range-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--color-myspa-turquoise);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.range-slider--active::-moz-range-thumb {
  background: var(--color-myspa-turquoise);
}

.range-slider::-moz-range-progress {
  background: var(--color-myspa-turquoise);
  border-radius: 2px;
}

.range-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}
</style>
