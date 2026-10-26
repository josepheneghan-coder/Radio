import React, { useState } from 'react';
import { Disc, Clock, MapPin, ListMusic, CassetteTape, Lock } from 'lucide-react';
import { Show } from '../types/radio';
import { SHOWS_DATA } from '../data/radioData';

interface ShowsArchiveGridProps {
  onPlayShow?: (show: Show) => void;
  activeShowId?: string | null;
  isPlaying?: boolean;
  onOpenShowDetail: (show: Show) => void;
}

export const ShowsArchiveGrid: React.FC<ShowsArchiveGridProps> = ({
  onOpenShowDetail,
}) => {
  const [filterGenre, setFilterGenre] = useState<string>('all');

  const genres = ['all', 'Minimal Synth', 'Dub Techno', 'Acid 303', 'Ambient'];

  const filteredShows = SHOWS_DATA.filter((show) => {
    if (filterGenre === 'all') return true;
    return show.genres.some((g) => g.toLowerCase().includes(filterGenre.toLowerCase()));
  });

  return (
    <section id="shows" className="w-full bg-[#0a0a0a] text-white py-14 sm:py-16 px-4 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs uppercase tracking-widest mb-1">
              <Disc size={14} className="text-yellow-400" />
              <span>TAPE ARCHIVE · ANALOG MASTER RECORDINGS</span>
            </div>
            <h2 className="font-display font-black text-section-display uppercase tracking-[-0.035em]">
              TAPE ARCHIVE & SHOWS
            </h2>
          </div>

          {/* Interactive filter tabs — Architectural hardware styling */}
          <div className="flex flex-wrap items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 font-ui font-bold text-xs">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`min-h-[36px] px-3.5 py-1.5 transition-colors uppercase cursor-pointer ${
                  filterGenre === g
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Global Archive Banner notice */}
        <div className="mb-8 p-3.5 sm:p-4 bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-neutral-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-neutral-500 shrink-0" />
            <span className="font-bold text-white uppercase tracking-wider">
              ARCHIVE STATUS:
            </span>
            <span className="text-neutral-400 font-ui text-xs">
              Physical master tapes currently undergoing Revox B77 analog digitization. Complete tracklists and studio liner notes are viewable below.
            </span>
          </div>
          <span className="text-yellow-400 text-[11px] shrink-0 font-bold uppercase tracking-wider">
            [REVOX B77 MASTER TAPE TRANSFER]
          </span>
        </div>

        {/* Dark Grid of Shows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredShows.map((show, idx) => {
            return (
              <div
                key={show.id}
                className="bg-[#111111] border border-neutral-800 hover:border-neutral-600 transition-all group flex flex-col justify-between overflow-hidden"
              >
                {/* Cover Art Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                  <img
                    src={show.coverUrl}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />

                  {/* Location badge overlay */}
                  <div className="absolute top-3 left-3 bg-black/90 backdrop-blur px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border border-neutral-700 text-white flex items-center gap-1.5">
                    <MapPin size={10} className="text-yellow-400" />
                    <span>{show.location}</span>
                  </div>

                  {/* Catalog ID Overlay */}
                  <div className="absolute top-3 right-3 bg-black/90 px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase border border-neutral-700 text-neutral-300 flex items-center gap-1">
                    <span>CAT. KNT-00{idx + 1}</span>
                  </div>

                  {/* Click to open tracklist overlay */}
                  <button
                    onClick={() => onOpenShowDetail(show)}
                    aria-label={`View tracklist for ${show.title}`}
                    className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer"
                  >
                    <div className="px-4 py-2.5 bg-white text-black font-ui font-bold text-xs uppercase tracking-wider border border-black flex items-center gap-2">
                      <ListMusic size={14} />
                      <span>VIEW TRACKLIST</span>
                    </div>
                  </button>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
                      <span className="tabular-nums">{show.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock size={11} />
                        {show.duration}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-card-display uppercase text-white group-hover:text-yellow-400 transition-colors leading-snug">
                      {show.title}
                    </h3>

                    <p className="font-ui text-xs text-neutral-300 mt-1">
                      Resident: <strong className="text-white">{show.host}</strong>
                    </p>

                    <p className="font-ui text-[12px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {show.description}
                    </p>
                  </div>

                  {/* Genres Unboxed & Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-yellow-400 tracking-wider mb-3 truncate uppercase">
                      {show.genres.join(' · ')}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenShowDetail(show)}
                        className="min-h-[40px] flex-1 py-2 bg-neutral-900 border border-neutral-700 hover:border-neutral-400 text-neutral-200 hover:text-white font-ui font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ListMusic size={13} />
                        <span>TRACKLIST & LINER</span>
                      </button>

                      <div
                        title="Master tape transfer in progress"
                        className="h-10 px-2.5 bg-neutral-950 border border-neutral-800 text-neutral-400 flex items-center justify-center font-mono text-[10px] tracking-wider uppercase shrink-0"
                      >
                        STANDBY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
