<script lang="ts" setup>
import { onMounted, ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const visible = ref(false);
const DISMISS_KEY = 'myspa-install-prompt-dismissed';

onMounted(() => {
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (dismissed === 'true') return;

  window.addEventListener(
    'beforeinstallprompt',
    (e: Event) => {
      e.preventDefault();
      deferredPrompt.value = e as BeforeInstallPromptEvent;
      visible.value = true;
    },
    { once: true },
  );
});

async function install() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
  }
  visible.value = false;
  localStorage.setItem(DISMISS_KEY, 'true');
}

function dismiss() {
  visible.value = false;
  localStorage.setItem(DISMISS_KEY, 'true');
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 bg-myspa-blue text-white shadow-lg"
    >
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <span
            class="inline-block h-6 w-6 rounded-full bg-white/20"
            aria-hidden="true"
          />
          <span class="font-overpass-semibold text-sm">
            {{$t('install.title')}}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded bg-white px-4 py-2 font-overpass-semibold text-sm text-myspa-blue transition-colors duration-200 hover:bg-myspa-turquoise-light"
            @click="install"
          >
            {{$t('install.install')}}
          </button>
          <button
            class="rounded border border-white/60 bg-transparent px-3 py-2 font-overpass text-sm transition-colors duration-200 hover:bg-white/10"
            @click="dismiss"
          >
            {{$t('install.later')}}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
