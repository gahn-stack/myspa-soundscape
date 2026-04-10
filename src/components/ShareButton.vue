<script setup lang="ts">
import { ref } from 'vue';
import { useShareUrl } from '@/composables/useShareUrl';

const { copyToClipboard, nativeShare, hasNativeShare } = useShareUrl();
const showToast = ref(false);

async function handleShare() {
  if (hasNativeShare()) {
    const shared = await nativeShare();
    if (shared) return;
  }

  const copied = await copyToClipboard();
  if (copied) {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  }
}
</script>

<template>
  <div class="relative inline-block">
    <button
      class="rounded-full bg-myspa-blue-alt px-6 py-3 font-overpass-semibold text-white transition-colors duration-200 hover:bg-myspa-blue"
      @click="handleShare"
    >
      {{$t('share.button')}}
    </button>
    <Transition name="toast-fade">
        <span
          v-if="showToast"
          class="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-myspa-blue px-3 py-1 font-overpass text-sm text-white"
        >
        {{$t('share.copied')}}
        </span>
    </Transition>
  </div>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 4px);
}
</style>
