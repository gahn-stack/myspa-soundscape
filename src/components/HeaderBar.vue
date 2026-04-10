<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SvgLogo from '@/components/SvgLogo.vue';

const emit = defineEmits<{
  showGuide: [];
}>();

const { locale } = useI18n();

function toggleLocale() {
  locale.value = locale.value === 'de' ? 'en' : 'de';
  localStorage.setItem('myspa-soundscape-locale', locale.value);
}

const isHidden = ref(false);
let lastScrollY = 0;
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 60) {
      isHidden.value = true;
    } else {
      isHidden.value = false;
    }
    lastScrollY = currentY;
    ticking = false;
  });
}

onMounted(() => {
  lastScrollY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <header
    class="sticky top-0 z-40 grid grid-cols-3 items-center bg-myspa-blue p-4 text-white shadow-sm transition-transform duration-300 ease-in-out"
    :class="{ '-translate-y-full': isHidden }"
  >
    <div class="w-16"><SvgLogo white /></div>
    <span class="text-center font-overpass-light text-[20px] tracking-wide text-myspa-turquoise-light">{{$t('app.title')}}</span>
    <div class="flex items-center justify-end gap-2">
      <button
        class="flex h-7 w-7 items-center justify-center rounded-full border border-myspa-turquoise/60 text-myspa-turquoise-light transition-colors duration-200 hover:bg-myspa-turquoise/20"
        @click="emit('showGuide')"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      <button
        class="rounded-full border border-myspa-turquoise/60 px-3 py-1 font-overpass-semibold text-xs text-myspa-turquoise-light transition-colors duration-200 hover:bg-myspa-turquoise/20"
        @click="toggleLocale"
      >
        {{ locale === 'de' ? 'EN' : 'DE' }}
      </button>
    </div>
  </header>
</template>
