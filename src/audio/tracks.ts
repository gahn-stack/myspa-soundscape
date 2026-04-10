import bowlsIcon from '@/assets/gfx/icons/bowls.svg';
import cricketsIcon from '@/assets/gfx/icons/crickets.svg';
import fireIcon from '@/assets/gfx/icons/fire.svg';
import forestIcon from '@/assets/gfx/icons/forest.svg';
import oceanIcon from '@/assets/gfx/icons/ocean.svg';
import rainIcon from '@/assets/gfx/icons/rain.svg';
import thunderIcon from '@/assets/gfx/icons/thunder.svg';
import waterIcon from '@/assets/gfx/icons/water.svg';
import whiteNoiseIcon from '@/assets/gfx/icons/white-noise.svg';
import windIcon from '@/assets/gfx/icons/wind.svg';

export interface TrackDefinition {
  id: string;
  label: string;
  icon: string;
  assetPath: string;
  core: boolean;
  color: string;
}

export const TRACKS: TrackDefinition[] = [
  {
    id: 'rain',
    label: 'tracks.rain',
    icon: rainIcon,
    assetPath: '/audio/rain.mp3',
    core: true,
    color: 'myspa-blue-sky',
  },
  {
    id: 'fire',
    label: 'tracks.fire',
    icon: fireIcon,
    assetPath: '/audio/fire.mp3',
    core: true,
    color: 'myspa-yellow',
  },
  {
    id: 'bowls',
    label: 'tracks.bowls',
    icon: bowlsIcon,
    assetPath: '/audio/bowls.mp3',
    core: true,
    color: 'myspa-turquoise',
  },
  {
    id: 'forest',
    label: 'tracks.forest',
    icon: forestIcon,
    assetPath: '/audio/forest.mp3',
    core: false,
    color: 'myspa-selection-green',
  },
  {
    id: 'water',
    label: 'tracks.water',
    icon: waterIcon,
    assetPath: '/audio/water.mp3',
    core: false,
    color: 'myspa-turquoise-dark',
  },
  {
    id: 'wind',
    label: 'tracks.wind',
    icon: windIcon,
    assetPath: '/audio/wind.mp3',
    core: false,
    color: 'myspa-blue-light',
  },
  {
    id: 'ocean',
    label: 'tracks.ocean',
    icon: oceanIcon,
    assetPath: '/audio/ocean.mp3',
    core: false,
    color: 'myspa-blue-alt',
  },
  {
    id: 'crickets',
    label: 'tracks.crickets',
    icon: cricketsIcon,
    assetPath: '/audio/crickets.mp3',
    core: false,
    color: 'myspa-turquoise-medium',
  },
  {
    id: 'thunder',
    label: 'tracks.thunder',
    icon: thunderIcon,
    assetPath: '/audio/thunder.mp3',
    core: false,
    color: 'myspa-blue-shade',
  },
  {
    id: 'white-noise',
    label: 'tracks.white-noise',
    icon: whiteNoiseIcon,
    assetPath: '/audio/white-noise.mp3',
    core: false,
    color: 'myspa-disabled-grey',
  },
];

export const TRACK_INDEX_ORDER: string[] = TRACKS.map((t) => t.id);
