<script setup lang="ts">
import { ref } from 'vue';
import FooterBar from '@/components/FooterBar.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import InstallPrompt from '@/components/InstallPrompt.vue';
import MasterControls from '@/components/MasterControls.vue';
import OnboardingGuide from '@/components/OnboardingGuide.vue';
import SavedMixes from '@/components/SavedMixes.vue';
import ShareButton from '@/components/ShareButton.vue';
import SleepTimer from '@/components/SleepTimer.vue';
import StartOverlay from '@/components/StartOverlay.vue';
import TrackGrid from '@/components/TrackGrid.vue';

const onboardingGuide = ref<InstanceType<typeof OnboardingGuide> | null>(null);

function onOverlayFinished() {
  onboardingGuide.value?.showIfFirstTime();
}

function onShowGuide() {
  onboardingGuide.value?.show();
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <StartOverlay @finished="onOverlayFinished" />

    <HeaderBar @show-guide="onShowGuide" />

    <main class="flex flex-1 flex-col gap-6 pb-24 md:pb-6">
      <TrackGrid />

      <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
        <MasterControls />

        <div class="flex flex-col gap-4 md:flex-row">
          <SleepTimer class="flex-1" />
          <SavedMixes class="flex-1" />
        </div>

        <div class="flex justify-center py-2">
          <ShareButton />
        </div>
      </div>
    </main>

    <FooterBar />
    <InstallPrompt />
    <OnboardingGuide ref="onboardingGuide" />
  </div>
</template>
