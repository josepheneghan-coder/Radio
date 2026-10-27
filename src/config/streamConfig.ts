/**
 * KONTROLL // SUB-FREQ INDIE RADIO
 * Central Stream Configuration
 *
 * To connect your own live stream, set STREAM_URL below.
 * Supported protocols: Icecast / Shoutcast MP3, AAC, OGG, Opus, or HLS (.m3u8).
 *
 * When STREAM_URL is empty (""), the player operates in a clean STANDBY / OFFLINE state
 * with zero foreign station streams and zero fake auto-play.
 */

export interface StreamConfig {
  STREAM_URL: string;
  FALLBACK_STREAM_URL?: string;
  STATION_NAME: string;
  PRIMARY_FEED_NAME: string;
  FREQUENCY: string;
  LOCATION: string;
  BITRATE: string;
  GENRE: string;
  // Audio source attribution decoupled from visual layout
  AUDIO_SOURCE_ORIGIN: string;
}

export const STREAM_CONFIG: StreamConfig = {
  // Restored original live stream source from Ibiza Global Radio:
  STREAM_URL: 'https://cdn-peer012.streaming-pro.com:8025/ibizaglobalradio.mp3',
  FALLBACK_STREAM_URL: 'https://cdn-peer012.streaming-pro.com:8025/ibizaglobalradio.mp3',

  // Audio source origin (managed independently from visual branding)
  AUDIO_SOURCE_ORIGIN: 'Ibiza Global Radio Live Stream Feed',

  // Visible Station Metadata (KONTROLL brand identity)
  STATION_NAME: 'KONTROLL · SUB-FREQ INDIE RADIO',
  PRIMARY_FEED_NAME: 'KONTROLL TRANSMISSION',
  FREQUENCY: '104.5 FM',
  LOCATION: 'Berlin Studio · Container #04',
  BITRATE: '320 kbps Icecast',
  GENRE: 'Underground Electronic · Deep Techno · Minimal',
};

