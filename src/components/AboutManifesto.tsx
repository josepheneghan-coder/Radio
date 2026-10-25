import React from 'react';
import { Radio, Mic, Flame, Disc } from 'lucide-react';

export const AboutManifesto: React.FC = () => {
  return (
    <section id="about" className="w-full bg-[#EAE8E2] text-black py-16 px-4 md:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto">
        {/* Header banner */}
        <div className="mb-10 pb-4 border-b-2 border-black flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-black/70 mb-1">
              MANIFESTO // OPERATIONAL ARCHITECTURE
            </div>
            <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight uppercase">
              NOT AN ALGORITHM.
            </h2>
          </div>
          <div className="font-mono text-xs text-black/70 max-w-sm">
            Founded in a repurposed steel shipping container in Berlin-Kreuzberg, expanded to Brooklyn & London.
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-2 border-black bg-white p-6 sticker-shadow">
            <div className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center font-display font-black text-xl mb-4">
              01
            </div>
            <h3 className="font-display font-black text-xl uppercase mb-2">
              RADICAL SELECTOR AUTONOMY
            </h3>
            <p className="font-mono text-xs text-neutral-700 leading-relaxed">
              Every host has 100% curation freedom. No corporate labels, no pay-to-play, no automated recommendation engines. We play what needs to be heard.
            </p>
          </div>

          <div className="border-2 border-black bg-white p-6 sticker-shadow">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-black text-xl mb-4">
              02
            </div>
            <h3 className="font-display font-black text-xl uppercase mb-2">
              OPEN STREET ACCESS
            </h3>
            <p className="font-mono text-xs text-neutral-700 leading-relaxed">
              Our kiosks face the public street. Passersby watch DJs spin vinyl through the double-pane container windows. Radio is an open physical town square.
            </p>
          </div>

          <div className="border-2 border-black bg-white p-6 sticker-shadow">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-black text-xl mb-4">
              03
            </div>
            <h3 className="font-display font-black text-xl uppercase mb-2">
              COMMUNITY FUNDED ARCHIVE
            </h3>
            <p className="font-mono text-xs text-neutral-700 leading-relaxed">
              Operated on zero advertising. Financed purely by listener support, merchandise, and DIY cassette runs. All audio streams are open-source and free worldwide.
            </p>
          </div>
        </div>

        {/* Studio Specs */}
        <div className="mt-10 p-6 bg-black text-white border-2 border-black flex flex-wrap items-center justify-between gap-6 font-mono text-xs">
          <div>
            <span className="text-yellow-400 font-bold">HARDWARE CHAIN:</span> Technics 1200MK7 · Condesa Rotary Mixer · Revox B77 Tape Machine · Shure SM7B
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>BITRATE: 320 KBPS ICECAST</span>
            <span>·</span>
            <span>OPEN DEMO SUBMISSIONS OPEN</span>
          </div>
        </div>
      </div>
    </section>
  );
};
