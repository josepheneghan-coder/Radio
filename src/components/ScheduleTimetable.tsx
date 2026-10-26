import React, { useState } from 'react';
import { Calendar, Globe, Radio, Bell, Check } from 'lucide-react';
import { SCHEDULE_TODAY } from '../data/radioData';

interface ScheduleTimetableProps {
  onTuneInLive: () => void;
  isPlaying: boolean;
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  onTuneInLive,
  isPlaying,
}) => {
  const [selectedTz, setSelectedTz] = useState<'CET' | 'EST' | 'GMT' | 'JST'>('CET');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const toggleReminder = (title: string) => {
    setReminders((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <section id="schedule" className="w-full bg-[#0d0d0d] text-white py-16 px-4 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest mb-1">
              <Calendar size={14} />
              <span>TIMETABLE // TODAY'S LIVE BROADCASTS</span>
            </div>
            <h2 className="font-display font-black text-section-display uppercase">
              TRANSMISSION SCHEDULE
            </h2>
          </div>

          {/* Timezone Switcher */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-neutral-400 flex items-center gap-1 font-ui font-semibold">
              <Globe size={13} /> TIMEZONE:
            </span>
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-1 font-ui font-bold text-xs">
              {(['CET', 'EST', 'GMT', 'JST'] as const).map((tz) => (
                <button
                  key={tz}
                  onClick={() => setSelectedTz(tz)}
                  className={`min-h-[34px] px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedTz === tz
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timetable Rows */}
        <div className="border border-neutral-800 divide-y divide-neutral-800 bg-[#111111]">
          {SCHEDULE_TODAY.map((slot, idx) => {
            const hasReminder = reminders[slot.showTitle];

            return (
              <div
                key={idx}
                className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  slot.isLiveNow ? 'bg-neutral-900/90 border-l-4 border-l-red-500' : 'hover:bg-neutral-900/40'
                }`}
              >
                {/* Time & Live Indicator */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  {slot.isLiveNow ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold tracking-widest uppercase">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>ON AIR</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-neutral-400">UPCOMING</span>
                  )}
                  <span className="font-mono text-sm md:text-base font-bold tabular-nums text-white">
                    {slot.time} {selectedTz}
                  </span>
                </div>

                {/* Show Title & Host */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-lg md:text-2xl uppercase text-white tracking-tight leading-tight">
                      {slot.showTitle}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-400 mt-1">
                    <span className="font-ui">Host: <strong className="text-neutral-200">{slot.host}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Studio: {slot.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-yellow-400 uppercase font-semibold">{slot.genre}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {slot.isLiveNow ? (
                    <button
                      onClick={onTuneInLive}
                      className="min-h-[40px] px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 font-ui font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Radio size={14} />
                      <span>{isPlaying ? 'LISTENING NOW' : 'LISTEN LIVE'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleReminder(slot.showTitle)}
                      className={`min-h-[40px] px-3.5 py-1.5 border font-ui font-semibold text-xs tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                        hasReminder
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-neutral-700 hover:border-neutral-400 text-neutral-300'
                      }`}
                    >
                      {hasReminder ? <Check size={13} /> : <Bell size={13} />}
                      <span>{hasReminder ? 'REMINDER SET' : 'NOTIFY ME'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
