export interface TrackState {
  trackId: string;
  volume: number;
  isActive: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
}

export interface SavedMix {
  id: string;
  name: string;
  createdAt: number;
  trackVolumes: Record<string, number>;
  masterVolume: number;
}

export interface SoundscapeState {
  masterVolume: number;
  trackVolumes: Record<string, number>;
}

export type AudioSourceType = 'default' | 'file';

export interface AudioSource {
  type: AudioSourceType;
  label: string;
  objectUrl?: string;
}
