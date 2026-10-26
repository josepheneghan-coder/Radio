# KONTROLL RADIO — Independent Electronic Broadcast System

A modern, high-contrast web application and audio streaming system for **KONTROLL RADIO**, an independent underground electronic radio station inspired by international club culture (Berlin, Ibiza, London, and Brooklyn).

![KONTROLL RADIO Preview](/public/og-image.jpg)

## Features

- **Live Stream Relay**: Real-time integration of live MP3 audio broadcast streams with reconnection and buffering detection.
- **Procedural Analog Audio Engine**: Web Audio API synthesizer for offline/fallback soundscapes (Minimal Synth, Dub Techno, Acid 303, and Ambient Drones).
- **Persistent Bottom Audio Player**: Uninterrupted playback across all views, featuring live HTML5 Canvas frequency visualizer, volume controls, tape warmth saturation filter, and a live DJ soundboard (Vinyl Scratch, Rave Airhorn, Rewind, 808 Sub Drop, Station ID).
- **Studio Surveillance Cam**: CCTV-style DJ booth live feed with real-time timecode, camera angle switcher (Turntables, Interior, Vinyl Crates), video filter presets, and interactive fan shoutbox.
- **Interactive Sticker Wall & Slap Mode**: Authentic pop-art, acid-house, and graffiti stickers with drag-and-drop physics, density controls, and custom sticker stamping.
- **Curated Archives & Tracklist Inspector**: Detailed show database with timestamps, record labels, and direct mix streaming.
- **Multi-Timezone Broadcast Timetable**: Daily schedule with live countdowns and CET, EST, GMT, and JST timezone converter.
- **Merchandise & Physical Releases**: Independent radio merch catalog with interactive bag management.
- **2026/2027 Club Typography**: Contemporary typographic hierarchy pairing Archivo (Display), Space Grotesk (Interface), and IBM Plex Mono (Broadcast metadata).
- **Mobile-First Responsive Design**: Fluid `clamp()` typography, thumb-friendly touch targets ($\ge 44\text{px}$), and safe-area padding for mobile browsers.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Audio**: Web Audio API + HTML5 Audio Streaming

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kontroll-radio.git

# Navigate to the project directory
cd kontroll-radio

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
# Generate production bundle
npm run build

# Preview production build locally
npm run preview
```

## Configuration

Environment variables can be set in `.env`:

```env
# Optional API key for server-side generative audio/metadata processing
GEMINI_API_KEY="your-api-key"

# Public base URL for canonical and OpenGraph links
APP_URL="https://kontroll-radio.fm"
```

## License

MIT License. Crafted for the independent electronic music community.
