<script setup lang="ts">
import { ref } from 'vue';
import SvgLogo from '@/components/SvgLogo.vue';
import { useAudioEngine } from '@/composables/useAudioEngine';

const emit = defineEmits<{
  finished: [];
}>();

const audioEngineReady = ref(false);
const { init, playMix, restoreSession, getRestoredMasterVolume } = useAudioEngine(audioEngineReady);

const dismissed = ref(false);
const transitioning = ref(false);

async function handleStart() {
  transitioning.value = true;
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    await init();
    const restoredTracks = restoreSession();
    if (restoredTracks) {
      const masterVol = getRestoredMasterVolume();
      await playMix(restoredTracks, masterVol);
    }
  } catch {}
  setTimeout(() => {
    dismissed.value = true;
    emit('finished');
  }, 600);
}
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="!dismissed"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-myspa-blue text-white"
      :class="{ 'overlay-exit': transitioning }"
    >
      <div class="mb-8 h-20"><SvgLogo white /></div>
      <h1 class="font-overpass-light text-[28px] tracking-wide">{{$t('app.title')}}</h1>
      <p class="mb-12 font-overpass text-lg text-myspa-turquoise-light">{{$t('app.subtitle')}}</p>
        <button
        class="font-overpass-semibold rounded-full border-2 border-myspa-turquoise px-10 py-4 text-lg text-myspa-turquoise transition-all duration-300 hover:bg-myspa-turquoise hover:text-myspa-blue pulse-gentle"
        @click="handleStart"
      >
        {{$t('overlay.start')}}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-fade-leave-active {
  transition: opacity 0.6s ease;
}
.overlay-fade-leave-to {
  opacity: 0;
}

@keyframes gentle-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(186, 225, 232, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(186, 225, 232, 0);
  }
}

.pulse-gentle {
  animation: gentle-pulse 2.5s ease-in-out infinite;
}
</style>
