<template>
  <div
    class="sticky bottom-0 z-30 flex items-center justify-between gap-4 rounded-xl bg-myspa-blue p-4 text-white shadow-[0_-4px_20px_rgba(28,43,110,0.15)] md:shadow-none"
  >
    <div class="flex items-center gap-3">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-myspa-turquoise transition-all duration-300"
        :class="{
          'bg-myspa-turquoise text-myspa-blue shadow-lg shadow-myspa-turquoise/30': store.isPlaying,
          'hover:bg-myspa-turquoise/20': !store.isPlaying,
        }"
        @click="handleTogglePlayback"
      >
        <Transition name="icon-swap" mode="out-in">
          <!-- Pause icon -->
          <svg
            v-if="store.isPlaying"
            key="pause"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <!-- Play icon -->
          <svg
            v-else
            key="play"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86Z" />
          </svg>
        </Transition>
      </button>
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full border border-myspa-turquoise/60 transition-all duration-200 hover:bg-myspa-turquoise/20"
        @click="handleStop"
      >
        <!-- Stop icon -->
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      </button>
    </div>

    <div class="flex flex-1 flex-col items-center gap-1">
      <span class="font-overpass text-xs text-myspa-turquoise-light">
        {{$t('player.soundsActive', { count: store.activeTrackCount })}}
      </span>
      <span class="font-overpass text-[10px] text-myspa-turquoise-light/60">
        {{$t('player.volume', { value: Math.round(store.masterVolume * 100) })}}
      </span>
      <input
        :value="Math.round(store.masterVolume * 100)"
        type="range"
        min="0"
        max="100"
        step="1"
        class="master-slider w-full"
        :style="{ '--value-percent': `${Math.round(store.masterVolume * 100)}%` }"
        @input="handleMasterVolume"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAudioEngine } from '@/composables/useAudioEngine';
import { useSoundscapeStore } from '@/stores/soundscape.store';

const store = useSoundscapeStore();
const isInitialized = ref(false);
const { updateMasterVolume, stopAll, playMix } = useAudioEngine(isInitialized);

const lastMix = ref<{ trackVolumes: Record<string, number>; masterVolume: number } | null>(null);

function handleMasterVolume(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  updateMasterVolume(value / 100);
}

function handleStop() {
  lastMix.value = null;
  stopAll();
  store.resetToDefaults();
  updateMasterVolume(0.5);
}

async function handleTogglePlayback() {
  if (store.isPlaying) {
    const activeOnly: Record<string, number> = {};
    for (const trackId of store.activeTrackIds) {
      const vol = store.trackVolumes[trackId];
      if (vol !== undefined && vol > 0) {
        activeOnly[trackId] = vol;
      }
    }
    lastMix.value = { trackVolumes: activeOnly, masterVolume: store.masterVolume };
    stopAll();
  } else if (lastMix.value) {
    await playMix(lastMix.value.trackVolumes, lastMix.value.masterVolume);
  }
}
</script>

<style scoped>
.master-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--color-myspa-turquoise) 0%,
    var(--color-myspa-turquoise) var(--value-percent, 70%),
    rgba(186, 225, 232, 0.3) var(--value-percent, 70%),
    rgba(186, 225, 232, 0.3) 100%
  );
  outline: none;
  touch-action: none;
}

.master-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-myspa-turquoise);
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(186, 225, 232, 0.2);
  transition: transform 0.2s ease;
}

.master-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.master-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: var(--color-myspa-turquoise);
  cursor: pointer;
}

.master-slider::-moz-range-progress {
  background: var(--color-myspa-turquoise);
  border-radius: 2px;
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.15s ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
