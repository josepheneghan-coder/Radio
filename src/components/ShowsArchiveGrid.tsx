import React, { useState } from 'react';
import { Play, Pause, Disc, Clock, MapPin, ListMusic } from 'lucide-react';
import { Show } from '../types/radio';
import { SHOWS_DATA } from '../data/radioData';
import { audioEngine } from '../utils/audioEngine';

interface ShowsArchiveGridProps {
  onPlayShow: (show: Show) => void;
  activeShowId: string | null;
  isPlaying: boolean;
  onOpenShowDetail: (show: Show) => void;
}

export const ShowsArchiveGrid: React.FC<ShowsArchiveGridProps> = ({
  onPlayShow,
  activeShowId,
  isPlaying,
  onOpenShowDetail,
}) => {
  const [filterGenre, setFilterGenre] = useState<string>('all');

  const genres = ['all', 'Minimal Synth', 'Dub Techno', 'Acid 303', 'Ambient'];

  const filteredShows = SHOWS_DATA.filter((show) => {
    if (filterGenre === 'all') return true;
    return show.genres.some((g) => g.toLowerCase().includes(filterGenre.toLowerCase()));
  });

  return (
    <section id="shows" className="w-full bg-[#0a0a0a] text-white py-16 px-4 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest mb-1">
              <Disc size={14} />
              <span>CURATED ARCHIVE // TAPES & RECENT BROADCASTS</span>
            </div>
            <h2 className="font-display font-black text-section-display uppercase">
              RADIO PICKS & RECENT MIXES
            </h2>
          </div>

          {/* Interactive filter tabs (functional buttons) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded font-ui font-bold text-xs">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded transition-colors uppercase cursor-pointer ${
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

        {/* Dark Grid of Shows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredShows.map((show) => {
            const isThisPlaying = activeShowId === show.id && isPlaying;

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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Location badge overlay */}
                  <div className="absolute top-3 left-3 bg-black/85 backdrop-blur px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border border-white/20 text-white flex items-center gap-1">
                    <MapPin size={10} className="text-yellow-400" />
                    <span>{show.location}</span>
                  </div>

                  {/* Play Mix Action overlay button */}
                  <button
                    onClick={() => onPlayShow(show)}
                    aria-label={`Play ${show.title}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                  >
                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center sticker-shadow group-hover:scale-110 transition-transform">
                      {isThisPlaying ? (
                        <Pause size={24} className="fill-current" />
                      ) : (
                        <Play size={24} className="fill-current ml-1" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed Metadata (Zero-Pill Discipline) */}
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
                      <span>{show.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
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

                    <p className="font-ui text-[12px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
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
                        onClick={() => onPlayShow(show)}
                        className={`min-h-[40px] flex-1 py-2 font-ui font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isThisPlaying
                            ? 'bg-yellow-400 text-black'
                            : 'bg-white text-black hover:bg-neutral-200'
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause size={12} className="fill-current" />
                            <span>PLAYING</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} className="fill-current" />
                            <span>PLAY MIX</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onOpenShowDetail(show)}
                        title="View tracklist"
                        className="w-10 h-10 flex items-center justify-center border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <ListMusic size={15} />
                      </button>
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
