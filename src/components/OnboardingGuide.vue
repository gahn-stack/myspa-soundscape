<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const ONBOARDING_KEY = 'myspa-soundscape-onboarding-done';

const { t } = useI18n();
const isVisible = ref(false);
const currentStep = ref(0);

const steps = [
  { titleKey: 'guide.step1Title', textKey: 'guide.step1Text', icon: '👋' },
  { titleKey: 'guide.step2Title', textKey: 'guide.step2Text', icon: '🔊' },
  { titleKey: 'guide.step3Title', textKey: 'guide.step3Text', icon: '⚙️' },
  { titleKey: 'guide.step4Title', textKey: 'guide.step4Text', icon: '🌙' },
  { titleKey: 'guide.step5Title', textKey: 'guide.step5Text', icon: '💚' },
];

const totalSteps = steps.length;

function show() {
  currentStep.value = 0;
  isVisible.value = true;
}

function showIfFirstTime() {
  if (!localStorage.getItem(ONBOARDING_KEY)) {
    show();
  }
}

function nextStep() {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++;
  } else {
    close();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function close() {
  isVisible.value = false;
  localStorage.setItem(ONBOARDING_KEY, '1');
}

defineExpose({ show, showIfFirstTime });
</script>

<template>
  <Teleport to="body">
    <Transition name="guide-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
        @click.self="close"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-4 text-center text-4xl">{{ steps[currentStep].icon }}</div>

          <h2 class="mb-2 text-center font-overpass-semibold text-lg text-myspa-blue">
            {{ $t(steps[currentStep].titleKey) }}
          </h2>
          <p class="mb-6 text-center font-overpass text-sm leading-relaxed text-myspa-blue/70">
            {{ $t(steps[currentStep].textKey) }}
          </p>

          <div class="mb-4 flex justify-center gap-1.5">
            <span
              v-for="i in totalSteps"
              :key="i"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="i - 1 === currentStep ? 'w-6 bg-myspa-blue' : 'w-1.5 bg-myspa-blue-shade/30'"
            />
          </div>

          <div class="flex gap-3">
            <button
              v-if="currentStep > 0"
              class="flex-1 rounded-full border border-myspa-blue-shade/40 px-4 py-2.5 font-overpass text-sm text-myspa-blue transition-colors duration-200 hover:bg-myspa-blue-light"
              @click="prevStep"
            >
              {{ $t('guide.back') }}
            </button>
            <button
              class="flex-1 rounded-full bg-myspa-blue px-4 py-2.5 font-overpass text-sm text-white transition-colors duration-200 hover:bg-myspa-blue-alt"
              @click="nextStep"
            >
              {{ currentStep < totalSteps - 1 ? $t('guide.next') : $t('guide.done') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.3s ease;
}
.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}
</style>
