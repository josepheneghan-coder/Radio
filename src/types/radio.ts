export type StreamStatus = 'idle' | 'buffering' | 'live' | 'error' | 'offline' | 'standby';

export type AnalysisMode = 'dsp' | 'modeled' | 'standby';

export interface ReactorMetrics {
  bpm: number;
  subDb: number;
  midDb: number;
  highDb: number;
  peakDb: number;
  ravePressure: boolean;
  analysisMode: AnalysisMode;
  clipDetected: boolean;
}

export interface Show {
  id: string;
  title: string;
  host: string;
  location: string;
  date: string;
  duration: string;
  genres: string[];
  coverUrl: string;
  description: string;
  bpm?: number;
  tracklist: {
    artist: string;
    title: string;
    label?: string;
    timestamp: string;
  }[];
  audioPreset?: 'stream' | 'synth' | 'dub' | 'acid' | 'ambient';
  isArchivedTape?: boolean;
}

export interface ScheduleItem {
  time: string;
  showTitle: string;
  host: string;
  location: string;
  genre: string;
  isLiveNow?: boolean;
}

export interface StickerItem {
  id: string;
  text: string;
  subtext?: string;
  type: 'acid' | 'stamp' | 'barcode' | 'graffiti' | 'badge' | 'tape' | 'vinyl';
  bgColor: string;
  textColor: string;
  borderColor?: string;
  rotation: number;
  x: number;
  y: number;
  scale?: number;
}

export interface MerchItem {
  id: string;
  title: string;
  price: string;
  category: string;
  imageUrl: string;
  badge?: string;
  specs: string;
}

export type ChannelId = 'main' | 'ch1' | 'ch2' | 'ch3';

export interface Channel {
  id: ChannelId;
  name: string;
  frequency: string;
  currentShow: string;
  dj: string;
  genre: string;
  location: string;
  bitrate: string;
  sourceType: 'stream' | 'standby';
  streamUrl?: string;
}
