# MySpa at Home — Relaxation Soundscape Generator

A minimal, ambient sound mixer that lets you layer natural sounds into personalized relaxation soundscapes. Built with Vue 3, Web Audio API, and Tailwind CSS v4.

**[→ Try it live](https://github.com/gahn-stack/myspa-soundscape)**

---

## Features

- **10 ambient sounds** — Rain, Fireplace, Singing Bowls, Forest & Birds, Flowing Water, Gentle Wind, Ocean Waves, Crickets & Night, Gentle Thunder, White Noise
- **Per-track volume controls** — Fine-tune each sound independently with smooth volume transitions
- **Master volume** — Global volume control with visual feedback
- **Play / Pause / Stop** — Pause preserves your mix; Stop resets to defaults
- **Sleep timer** — Auto-stop with gentle 30-second fade-out. Presets (15/30/60/90 min) or custom (1–480 min)
- **Saved mixes** — Name and save sound combinations. Changes auto-save back to the loaded mix
- **Share via URL** — Generate a link that encodes your current mix for anyone to open
- **Custom audio sources** — Upload your own MP3/WAV/OGG files per track via the gear icon
- **First-time onboarding** — Step-by-step guide on first visit, with header help button to reopen
- **Section help** — Contextual help for Sleep Timer and Saved Mixes via ? buttons
- **PWA support** — Install as a standalone app on mobile and desktop
- **i18n** — German (default) and English with persistent language preference
- **Session persistence** — Your current mix restores automatically on next visit
- **Mobile-first** — Touch-friendly sliders, hide-on-scroll header, responsive layout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3.3 (Composition API) |
| Language | TypeScript 5.3 |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 |
| State | Pinia |
| Audio | Web Audio API (native) |
| i18n | vue-i18n 9 |
| PWA | vite-plugin-pwa (Workbox) |
| Linting | Biome |
| Fonts | Overpass, MySpa Wellzone |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5180`.

### Build for Production

```bash
npm run build
npm run preview
```

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Biome lint & format check |
| `npm run format` | Biome auto-fix |

---

## Architecture

```
src/
├── audio/           # Web Audio API engine, track definitions, sleep timer
├── components/      # Vue components (UI layer)
├── composables/     # Shared logic (useAudioEngine, useShareUrl)
├── i18n/            # vue-i18n locale files (de, en)
├── models/          # TypeScript type definitions
├── stores/          # Pinia stores (soundscape, library, audio-source)
├── utils/           # Helpers (localStorage, URL encoding)
├── assets/          # Fonts, SVG icons, styles
└── App.vue          # Root component with overlay → main layout
```

### Audio Pipeline

The audio engine (`src/audio/engine.ts`) is a singleton wrapping the Web Audio API:

- **Lazy initialization** — AudioContext created on first user interaction (browser autoplay policy)
- **Buffer caching** — Decoded audio buffers cached per track, invalidated on source change
- **Per-track GainNodes** — Independent volume control with smooth `setTargetAtTime` transitions
- **3-second fade-in** — `linearRampToValueAtTime` on playback start
- **30-second fade-out** — Sleep timer gradually reduces master gain before stopping
- **Safari fallback** — Falls back to `webkitAudioContext` when needed

### State Management

Three Pinia stores handle persistence via `localStorage`:

| Store | Purpose | Storage Key |
|-------|---------|-------------|
| `soundscape` | Active tracks, volumes, errors, current mix link | `myspa-soundscape-session` |
| `library` | Saved mixes (name, track volumes, master volume) | `myspa-soundscape-mixes` |
| `audio-source` | Per-track custom audio sources | `myspa-soundscape-audio-sources` |

---

## Project Structure

The app follows a layered architecture:

1. **Audio layer** — Pure TypeScript, framework-agnostic audio engine
2. **Store layer** — Pinia stores with localStorage persistence
3. **Composable layer** — Bridge between stores and audio engine, handles session lifecycle
4. **Component layer** — Vue 3 SFCs with Composition API, Teleport modals, CSS transitions

---

## Custom Audio Sources

Users can replace any built-in sound with their own audio file:

1. Tap the gear icon on any track card
2. Switch to the **File** tab
3. Upload an MP3, WAV, or OGG file

> **Note:** Uploaded files are stored as blob URLs in the current browser session. On page reload, the file reference is preserved but the audio data needs to be re-uploaded.

---

## Deployment

The build output (`dist/`) is a fully static site. Deploy to any static hosting:

### Vercel (recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com) → Framework auto-detected as Vite
3. Deploy — done

### Manual

```bash
npm run build
# Upload dist/ to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, etc.)
```

---

## Replacing Placeholder Audio

The bundled audio files in `public/audio/*.mp3` are silent placeholders. To use real ambient sounds:

1. Download royalty-free audio from [Pixabay](https://pixabay.com/sound-effects/) or [Freesound](https://freesound.org)
2. Replace each `.mp3` file in `public/audio/` with the corresponding real audio
3. Keep filenames matching the track IDs in `src/audio/tracks.ts`

---

## License

Private — &copy; MySpa
