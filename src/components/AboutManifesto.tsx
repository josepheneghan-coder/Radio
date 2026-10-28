import React from 'react';

export const AboutManifesto: React.FC = () => {
  return (
    <section id="about" className="w-full bg-[#07070a] text-white py-14 sm:py-16 px-4 md:px-8 border-b border-[#1c1c24]">
      <div className="max-w-7xl mx-auto">
        {/* Header banner */}
        <div className="mb-10 pb-4 border-b border-[#1f1f2a] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/images_lllogo-removebg-preview_46d3cb66.png"
              alt="RADIO KONTROLLE Emblem"
              className="h-10 sm:h-12 w-auto object-contain shrink-0 filter brightness-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">
                MANIFESTO · OPERATIONAL ARCHITECTURE
              </div>
              <h2 className="font-display font-black text-section-display uppercase tracking-[-0.035em] text-white">
                NOT AN ALGORITHM.
              </h2>
            </div>
          </div>
          <div className="font-ui text-xs md:text-sm text-neutral-400 max-w-sm font-normal leading-relaxed">
            Founded in a repurposed steel shipping container in Berlin-Kreuzberg, expanded to Brooklyn and London.
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#20202d] bg-[#0c0c11] p-6 hover:border-neutral-500 transition-colors">
            <div className="w-9 h-9 bg-[#161622] text-white border border-[#272738] flex items-center justify-center font-display font-black text-sm mb-4">
              01
            </div>
            <h3 className="font-display font-black text-lg uppercase mb-2 tracking-tight text-white">
              RADICAL SELECTOR AUTONOMY
            </h3>
            <p className="font-ui text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Every host has 100% curation freedom. No corporate labels, no pay-to-play, no automated recommendation engines. We play what needs to be heard.
            </p>
          </div>

          <div className="border border-[#20202d] bg-[#0c0c11] p-6 hover:border-neutral-500 transition-colors">
            <div className="w-9 h-9 bg-[#161622] text-white border border-[#272738] flex items-center justify-center font-display font-black text-sm mb-4">
              02
            </div>
            <h3 className="font-display font-black text-lg uppercase mb-2 tracking-tight text-white">
              OPEN STREET ACCESS
            </h3>
            <p className="font-ui text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Our kiosks face the public street. Passersby watch DJs spin vinyl through the double-pane container windows. Radio is an open physical town square.
            </p>
          </div>

          <div className="border border-[#20202d] bg-[#0c0c11] p-6 hover:border-neutral-500 transition-colors">
            <div className="w-9 h-9 bg-[#161622] text-white border border-[#272738] flex items-center justify-center font-display font-black text-sm mb-4">
              03
            </div>
            <h3 className="font-display font-black text-lg uppercase mb-2 tracking-tight text-white">
              COMMUNITY FUNDED ARCHIVE
            </h3>
            <p className="font-ui text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Operated on zero advertising. Financed purely by listener support, merchandise, and DIY cassette runs. All audio streams are open-source and free worldwide.
            </p>
          </div>
        </div>

        {/* Studio Specs */}
        <div className="mt-8 p-4 sm:p-5 bg-[#0b0b10] text-white border border-[#1f1f2a] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-yellow-400 font-bold">HARDWARE CHAIN:</span> Technics 1200MK7 · Condesa Rotary Mixer · Revox B77 Tape Machine · Shure SM7B
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <span>BITRATE: 320 KBPS ICECAST</span>
            <span>·</span>
            <span className="text-emerald-400">DEMO SUBMISSIONS OPEN</span>
          </div>
        </div>
      </div>
    </section>
  );
};
