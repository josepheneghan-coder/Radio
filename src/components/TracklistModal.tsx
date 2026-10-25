import React from 'react';
import { X, Disc, Play, Clock } from 'lucide-react';
import { Show } from '../types/radio';

interface TracklistModalProps {
  show: Show | null;
  onClose: () => void;
  onPlayShow: (show: Show) => void;
  isPlaying: boolean;
  activeShowId: string | null;
}

export const TracklistModal: React.FC<TracklistModalProps> = ({
  show,
  onClose,
  onPlayShow,
  isPlaying,
  activeShowId,
}) => {
  if (!show) return null;

  const isCurrentPlaying = activeShowId === show.id && isPlaying;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#111111] text-white border-2 border-white/20 p-6 md:p-8 sticker-shadow max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close tracklist"
          className="absolute top-4 right-4 p-2 bg-neutral-900 border border-neutral-700 hover:bg-white hover:text-black transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6 pb-6 border-b border-neutral-800">
          <div className="w-24 h-24 shrink-0 bg-neutral-900 overflow-hidden border border-neutral-700">
            <img
              src={show.coverUrl}
              alt={show.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1">
            <div className="font-mono text-xs text-yellow-400 uppercase tracking-widest mb-1">
              ARCHIVE CASSETTE TAPE LOG
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight">
              {show.title}
            </h2>
            <div className="font-mono text-xs text-neutral-400 mt-1 flex flex-wrap gap-2">
              <span>Selector: <strong className="text-white">{show.host}</strong></span>
              <span>·</span>
              <span>{show.location}</span>
              <span>·</span>
              <span>{show.duration}</span>
            </div>
          </div>
        </div>

        {/* Play Action in Modal */}
        <div className="mb-6 flex items-center justify-between gap-4 p-3 bg-neutral-900 border border-neutral-800">
          <div className="font-mono text-xs text-neutral-300">
            Audio Synthesizer Preset: <strong className="text-yellow-400 uppercase">{show.audioPreset}</strong>
          </div>
          <button
            onClick={() => onPlayShow(show)}
            className="px-4 py-2 bg-white text-black hover:bg-yellow-400 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
          >
            <Play size={14} className="fill-current" />
            <span>{isCurrentPlaying ? 'PLAYING NOW' : 'STREAM THIS MIX'}</span>
          </button>
        </div>

        {/* Tracklist List */}
        <div>
          <h3 className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Disc size={14} />
            <span>OFFICIAL PLAYLIST & DUBPLATE CATALOG ({show.tracklist.length} TRACKS)</span>
          </h3>

          <div className="divide-y divide-neutral-800 border border-neutral-800 font-mono text-xs">
            {show.tracklist.map((track, i) => (
              <div
                key={i}
                className="p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 tabular-nums w-10">
                    {track.timestamp}
                  </span>
                  <div>
                    <span className="font-bold text-white">{track.artist}</span>
                    <span className="text-neutral-400"> — </span>
                    <span className="text-neutral-200">{track.title}</span>
                  </div>
                </div>

                {track.label && (
                  <span className="text-[11px] text-neutral-500 shrink-0">
                    [{track.label}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description & Liner Notes */}
        <div className="mt-6 pt-4 border-t border-neutral-800 font-mono text-xs text-neutral-400">
          <strong className="text-white block mb-1">LINER NOTES:</strong>
          <p>{show.description}</p>
        </div>
      </div>
    </div>
  );
};
