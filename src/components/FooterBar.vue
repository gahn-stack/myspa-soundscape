<script setup lang="ts">
import SvgLogo from '@/components/SvgLogo.vue';
</script>

<template>
  <footer class="flex items-center justify-center gap-2 bg-myspa-blue p-4 text-sm text-white">
    <div class="h-5"><SvgLogo white /></div>
    <span class="font-overpass">{{$t('app.title')}}</span>
    <span class="mx-2 text-myspa-turquoise-dark">|</span>
    <a
      href="https://myspa.me"
      target="_blank"
      rel="noopener noreferrer"
      class="font-overpass text-myspa-turquoise-light underline decoration-myspa-turquoise-light/40 transition-colors duration-200 hover:text-myspa-turquoise"
    >
      myspa.me
    </a>
  </footer>
</template>
