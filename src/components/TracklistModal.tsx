import React from 'react';
import { X, Disc, ListMusic, Clock, MapPin } from 'lucide-react';
import { Show } from '../types/radio';

interface TracklistModalProps {
  show: Show | null;
  onClose: () => void;
  onPlayShow?: (show: Show) => void;
  isPlaying?: boolean;
  activeShowId?: string | null;
}

export const TracklistModal: React.FC<TracklistModalProps> = ({
  show,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#111111] text-white border border-neutral-700 p-5 sm:p-8 shadow-[4px_4px_0px_#000] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close tracklist"
          className="absolute top-4 right-4 p-2 bg-neutral-900 border border-neutral-700 hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start mb-6 pb-6 border-b border-neutral-800">
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-neutral-900 overflow-hidden border border-neutral-700">
            <img
              src={show.coverUrl}
              alt={show.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">
              ARCHIVE CASSETTE TAPE LOG
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-[-0.035em]">
              {show.title}
            </h2>
            <div className="font-ui text-xs text-neutral-300 mt-1 flex flex-wrap gap-2 items-center">
              <span>Selector: <strong className="text-white">{show.host}</strong></span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-neutral-400" />
                {show.location}
              </span>
              <span className="text-neutral-600">·</span>
              <span className="font-mono tabular-nums flex items-center gap-1">
                <Clock size={11} className="text-neutral-400" />
                {show.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Archive Status Notice */}
        <div className="mb-6 p-3 bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-500" />
            <span className="text-neutral-400">TRANSFER STATUS:</span>
            <strong className="text-white uppercase">ANALOG DIGITIZATION IN PROGRESS</strong>
          </div>
          <span className="text-[10px] text-yellow-400 uppercase font-bold shrink-0">
            [TAPE ARCHIVE · MASTER TRANSFER]
          </span>
        </div>

        {/* Tracklist List */}
        <div>
          <h3 className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Disc size={14} className="text-yellow-400" />
            <span>PLAYLIST & DUBPLATE CATALOG ({show.tracklist.length} TRACKS)</span>
          </h3>

          <div className="divide-y divide-neutral-800 border border-neutral-800 font-ui text-xs">
            {show.tracklist.map((track, i) => (
              <div
                key={i}
                className="p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-neutral-500 tabular-nums w-12 text-[11px] shrink-0">
                    {track.timestamp}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-white">{track.artist}</span>
                    <span className="text-neutral-400"> — </span>
                    <span className="text-neutral-200">{track.title}</span>
                  </div>
                </div>

                {track.label && (
                  <span className="font-mono text-[10px] text-neutral-500 shrink-0 uppercase tracking-wider">
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
          <p className="leading-relaxed">{show.description}</p>
        </div>
      </div>
    </div>
  );
};
