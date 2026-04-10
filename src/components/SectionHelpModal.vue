<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  titleKey: string;
  textKey: string;
}>();

const { t } = useI18n();
const isVisible = ref(false);

function toggle() {
  isVisible.value = !isVisible.value;
}

function close() {
  isVisible.value = false;
}
</script>

<template>
  <button
    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-myspa-blue/40 transition-colors duration-200 hover:bg-myspa-blue/10 hover:text-myspa-blue"
    @click.stop="toggle"
  >
    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </button>

  <Teleport to="body">
    <Transition name="help-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 px-4"
        @click.self="close"
      >
        <div class="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl ring-1 ring-myspa-blue-shade/30">
          <h3 class="mb-2 font-overpass-semibold text-base text-myspa-blue">{{ $t(titleKey) }}</h3>
          <p class="font-overpass text-sm leading-relaxed text-myspa-blue/70">{{ $t(textKey) }}</p>
          <button
            class="mt-4 w-full rounded-full bg-myspa-blue px-4 py-2 font-overpass text-sm text-white transition-colors duration-200 hover:bg-myspa-blue-alt"
            @click="close"
          >
            {{ $t('guide.done') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.help-fade-enter-active,
.help-fade-leave-active {
  transition: opacity 0.2s ease;
}
.help-fade-enter-from,
.help-fade-leave-to {
  opacity: 0;
}
</style>
