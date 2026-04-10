<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AudioSource } from '@/models/types';
import { useAudioSourceStore } from '@/stores/audio-source.store';

const props = defineProps<{
  trackId: string;
}>();

const emit = defineEmits<{
  close: [];
  changed: [trackId: string];
}>();

const { t } = useI18n();
const sourceStore = useAudioSourceStore();

const currentSource = sourceStore.getSource(props.trackId);

const activeTab = ref<'default' | 'file'>(currentSource?.type === 'file' ? 'file' : 'default');
const fileName = ref(currentSource?.type === 'file' ? currentSource.label : '');
const fileObjectUrl = ref<string | null>(
  currentSource?.type === 'file' && currentSource.objectUrl ? currentSource.objectUrl : null,
);
const errorMessage = ref('');

const hasActiveFile = currentSource?.type === 'file';
const fileStillValid = hasActiveFile && !!currentSource.objectUrl;

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  errorMessage.value = '';

  if (!file.type.startsWith('audio/')) {
    errorMessage.value = t('source.errorNotAudio');
    return;
  }

  if (fileObjectUrl.value) {
    URL.revokeObjectURL(fileObjectUrl.value);
  }

  const objectUrl = URL.createObjectURL(file);
  fileName.value = file.name;
  fileObjectUrl.value = objectUrl;

  const source: AudioSource = { type: 'file', label: file.name, objectUrl };
  sourceStore.setSource(props.trackId, source);
  emit('changed', props.trackId);
  emit('close');
}

function handleReset() {
  if (fileObjectUrl.value) {
    URL.revokeObjectURL(fileObjectUrl.value);
    fileObjectUrl.value = null;
  }
  sourceStore.resetToDefault(props.trackId);
  emit('changed', props.trackId);
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 px-4" @click.self="emit('close')">
      <div class="w-full max-w-xs rounded-xl bg-white p-4 shadow-xl ring-1 ring-myspa-blue-shade/30">
        <div class="mb-3 flex gap-1 rounded-lg bg-myspa-blue-light p-1">
          <button
            class="flex-1 rounded-md px-2 py-1 font-overpass text-xs transition-colors duration-200"
            :class="activeTab === 'default' ? 'bg-white text-myspa-blue shadow-sm' : 'text-myspa-disabled-grey hover:text-myspa-blue'"
            @click="activeTab = 'default'"
          >
            {{$t('source.default')}}
          </button>
          <button
            class="flex-1 rounded-md px-2 py-1 font-overpass text-xs transition-colors duration-200"
            :class="activeTab === 'file' ? 'bg-white text-myspa-blue shadow-sm' : 'text-myspa-disabled-grey hover:text-myspa-blue'"
            @click="activeTab = 'file'"
          >
            {{$t('source.file')}}
          </button>
        </div>

        <div v-if="activeTab === 'default'" class="space-y-2">
          <p class="font-overpass text-xs text-myspa-disabled-grey">{{$t('source.defaultHint')}}</p>
          <button
            v-if="currentSource"
            class="w-full rounded-lg bg-myspa-error px-3 py-2 font-overpass text-xs text-white transition-colors duration-200 hover:opacity-80"
            @click="handleReset"
          >
            {{$t('source.reset')}}
          </button>
        </div>

        <div v-if="activeTab === 'file'" class="space-y-2">
          <div v-if="hasActiveFile" class="space-y-2">
            <div class="flex items-center gap-2 rounded-lg bg-myspa-blue-light px-3 py-2">
              <svg class="h-4 w-4 shrink-0 text-myspa-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span class="truncate font-overpass text-xs text-myspa-blue">{{ fileName }}</span>
              <span v-if="fileStillValid" class="ml-auto shrink-0 text-[10px] text-myspa-turquoise-dark">✓</span>
            </div>
            <p v-if="!fileStillValid" class="font-overpass text-[10px] leading-relaxed text-myspa-error">
              {{$t('source.fileLost')}}
            </p>
            <label class="flex w-full cursor-pointer items-center justify-center rounded-lg border border-myspa-blue-shade px-3 py-2 font-overpass text-xs text-myspa-blue transition-colors duration-200 hover:bg-myspa-blue-light">
              <input type="file" accept="audio/*" class="hidden" @change="handleFileSelect" />
              {{$t('source.fileReplace')}}
            </label>
            <button
              class="w-full rounded-lg bg-myspa-error px-3 py-2 font-overpass text-xs text-white transition-colors duration-200 hover:opacity-80"
              @click="handleReset"
            >
              {{$t('source.reset')}}
            </button>
          </div>
          <div v-else class="space-y-2">
            <label class="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-myspa-blue-shade px-3 py-4 font-overpass text-xs text-myspa-disabled-grey transition-colors duration-200 hover:border-myspa-turquoise-dark hover:text-myspa-blue">
              <input type="file" accept="audio/*" class="hidden" @change="handleFileSelect" />
              {{$t('source.fileHint')}}
            </label>
          </div>
          <p v-if="errorMessage" class="font-overpass text-xs text-myspa-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
