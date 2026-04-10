<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { audioEngine } from '@/audio/engine';
import SectionHelpModal from '@/components/SectionHelpModal.vue';
import { sleepTimer } from '@/audio/timer';
import { useSoundscapeStore } from '@/stores/soundscape.store';

const store = useSoundscapeStore();
const { t } = useI18n();

const presets = [15, 30, 60, 90] as const;
const activePreset = ref<number | null>(null);
const remainingSeconds = ref(0);
const toastMessage = ref('');
const customMinutes = ref<number | null>(null);
const showCustomInput = ref(false);

let countdownInterval: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

function startTimer(minutes: number) {
  if (countdownInterval) clearInterval(countdownInterval);

  const masterGain = audioEngine.getMasterGainNode();
  if (!masterGain) return;

  activePreset.value = minutes;
  remainingSeconds.value = minutes * 60;

  sleepTimer.start(minutes, masterGain, () => {
    store.stopAll();
    activePreset.value = null;
    remainingSeconds.value = 0;
    if (countdownInterval) clearInterval(countdownInterval);
    toastMessage.value = t('timer.ended');
    setTimeout(() => {
      toastMessage.value = '';
    }, 2000);
  });

  countdownInterval = setInterval(() => {
    remainingSeconds.value = sleepTimer.remainingSeconds;
    if (remainingSeconds.value <= 0 && countdownInterval) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function startPreset(minutes: number) {
  showCustomInput.value = false;
  startTimer(minutes);
}

function startCustom() {
  const minutes = customMinutes.value;
  if (!minutes || minutes < 1 || minutes > 480) return;
  startTimer(minutes);
  showCustomInput.value = false;
}

function toggleCustomInput() {
  showCustomInput.value = !showCustomInput.value;
  if (showCustomInput.value) {
    customMinutes.value = null;
  }
}

function cancelTimer() {
  const masterGain = audioEngine.getMasterGainNode();
  if (masterGain) {
    sleepTimer.cancel(masterGain, audioEngine.getMasterVolume());
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  activePreset.value = null;
  remainingSeconds.value = 0;
}
</script>

<template>
  <div class="rounded-xl bg-myspa-turquoise p-3">
    <div class="flex items-center gap-2">
      <span class="font-overpass-semibold text-myspa-blue">{{$t('timer.title')}}</span>
      <SectionHelpModal title-key="timer.guideTitle" text-key="timer.guideText" />
    </div>

    <div v-if="activePreset === null" class="mt-2">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presets"
          :key="preset"
          class="font-overpass rounded-full bg-myspa-blue px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-myspa-blue-alt"
          @click="startPreset(preset)"
        >
          {{$t('timer.minutes', { count: preset })}}
        </button>
        <button
          class="font-overpass rounded-full border border-myspa-blue px-4 py-2 text-sm text-myspa-blue transition-colors duration-200 hover:bg-myspa-blue hover:text-white"
          :class="{ 'bg-myspa-blue text-white': showCustomInput }"
          @click="toggleCustomInput"
        >
          {{$t('timer.custom')}}
        </button>
      </div>

      <div v-if="showCustomInput" class="mt-3 flex items-center gap-2">
        <input
          v-model.number="customMinutes"
          type="number"
          min="1"
          max="480"
          :placeholder="$t('timer.customPlaceholder')"
          class="w-24 rounded-lg border border-myspa-blue-shade px-3 py-2 font-overpass text-sm text-myspa-blue outline-none focus:border-myspa-turquoise-dark"
          @keyup.enter="startCustom"
        />
        <span class="font-overpass text-xs text-myspa-disabled-grey">{{$t('timer.customHint')}}</span>
        <button
          class="font-overpass-semibold rounded-full bg-myspa-blue px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-myspa-blue-alt disabled:opacity-40"
          :disabled="!customMinutes || customMinutes < 1 || customMinutes > 480"
          @click="startCustom"
        >
          {{$t('timer.start')}}
        </button>
      </div>
    </div>

    <div v-else class="mt-2 flex items-center gap-3">
      <span class="font-overpass-bold text-lg text-myspa-blue">{{ formattedTime }}</span>
      <button
        class="font-overpass rounded-full bg-myspa-blue-alt px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-myspa-error"
        @click="cancelTimer"
      >
        {{$t('timer.cancel')}}
      </button>
    </div>

    <Transition name="toast-slide">
      <div
        v-if="toastMessage"
        class="mt-2 rounded-lg bg-myspa-blue p-2 text-center font-overpass text-sm text-white"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
