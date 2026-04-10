<script setup lang="ts">
import { ref } from 'vue';
import { TRACKS } from '@/audio/tracks';
import { useAudioEngine } from '@/composables/useAudioEngine';
import { useSoundscapeStore } from '@/stores/soundscape.store';
import TrackCard from './TrackCard.vue';

const store = useSoundscapeStore();
const isInitialized = ref(false);
const { toggleTrackPlayback, updateTrackVolume, invalidateTrack } = useAudioEngine(isInitialized);

const loadingTrackIds = ref<string[]>([]);

async function handleToggle(trackId: string) {
  if (loadingTrackIds.value.includes(trackId)) return;
  loadingTrackIds.value = [...loadingTrackIds.value, trackId];
  await toggleTrackPlayback(trackId);
  loadingTrackIds.value = loadingTrackIds.value.filter((id) => id !== trackId);
}

function handleVolumeChange(trackId: string, volume: number) {
  updateTrackVolume(trackId, volume / 100);
}

async function handleSourceChanged(trackId: string) {
  const wasPlaying = store.isActive(trackId);
  invalidateTrack(trackId);

  if (wasPlaying) {
    store.setActive(trackId, false);
    if (loadingTrackIds.value.includes(trackId)) return;
    loadingTrackIds.value = [...loadingTrackIds.value, trackId];
    try {
      await toggleTrackPlayback(trackId);
    } finally {
      loadingTrackIds.value = loadingTrackIds.value.filter((id) => id !== trackId);
    }
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="grid grid-cols-2 gap-4 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <TrackCard
        v-for="track in TRACKS"
        :key="track.id"
        :track="track"
        :volume="Math.round((store.trackVolumes[track.id] ?? 0.5) * 100)"
        :is-active="store.isActive(track.id)"
        :is-loading="loadingTrackIds.includes(track.id)"
        :has-error="store.hasError(track.id)"
        @toggle="handleToggle"
        @volume-change="handleVolumeChange"
        @source-changed="handleSourceChanged"
      />
    </div>
  </div>
</template>
