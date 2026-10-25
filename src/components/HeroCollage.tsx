import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Stamp, RotateCcw, Volume2, Image as ImageIcon } from 'lucide-react';
import { INITIAL_STICKERS } from '../data/radioData';
import { StickerItem } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';

interface HeroCollageProps {
  onTuneIn: () => void;
  isPlaying: boolean;
}

const STICKER_TEMPLATES: Omit<StickerItem, 'id' | 'x' | 'y'>[] = [
  {
    text: 'ACID 303',
    subtext: 'ANALOG FREQUENCY',
    type: 'acid',
    bgColor: '#FFE500',
    textColor: '#000000',
    rotation: -8,
  },
  {
    text: 'NO ALGORITHM',
    subtext: 'FREE FORM AUDIO',
    type: 'stamp',
    bgColor: '#00FF66',
    textColor: '#000000',
    rotation: 7,
  },
  {
    text: 'KONTROLL RADIO',
    subtext: '104.5 MHz BERLIN',
    type: 'graffiti',
    bgColor: '#FF0055',
    textColor: '#FFFFFF',
    rotation: -12,
  },
  {
    text: 'VINYL ONLY',
    subtext: 'DIRECT DRIVE 33RPM',
    type: 'vinyl',
    bgColor: '#FF3300',
    textColor: '#FFFFFF',
    rotation: 14,
  },
  {
    text: 'CAUTION // BASS',
    subtext: 'SUB-WOOFER HAZARD',
    type: 'tape',
    bgColor: '#FFCC00',
    textColor: '#000000',
    rotation: -5,
  },
  {
    text: 'PEOPLE POWERED',
    subtext: 'NO CORPORATE ADS',
    type: 'badge',
    bgColor: '#00F0FF',
    textColor: '#000000',
    rotation: 9,
  },
];

export const HeroCollage: React.FC<HeroCollageProps> = ({ onTuneIn, isPlaying }) => {
  const [stickers, setStickers] = useState<StickerItem[]>(INITIAL_STICKERS);
  const [density, setDensity] = useState<number>(75); // 0 to 100
  const [bgOpacity, setBgOpacity] = useState<number>(85); // 20 to 100
  const [slapMode, setSlapMode] = useState<boolean>(false);
  const [scratchedEasterEgg, setScratchedEasterEgg] = useState<boolean>(false);
  const [lastSlapped, setLastSlapped] = useState<string | null>(null);

  // Slap sticker onto billboard
  const handleBillboardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!slapMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const template = STICKER_TEMPLATES[Math.floor(Math.random() * STICKER_TEMPLATES.length)];
    const randomRot = Math.floor(Math.random() * 32) - 16;

    const newSticker: StickerItem = {
      id: `custom-${Date.now()}`,
      ...template,
      x: Math.max(5, Math.min(85, x)),
      y: Math.max(5, Math.min(85, y)),
      rotation: randomRot,
      scale: 1,
    };

    setStickers((prev) => [...prev, newSticker]);
    audioEngine.playFX('scratch');
    setLastSlapped(newSticker.text);
    setTimeout(() => setLastSlapped(null), 1500);
  };

  const handleStickerClick = (e: React.MouseEvent, s: StickerItem) => {
    e.stopPropagation();
    audioEngine.playFX('scratch');
    if (s.id === 'st-1') {
      setScratchedEasterEgg(true);
    }
  };

  const handleReset = () => {
    setStickers(INITIAL_STICKERS);
    setScratchedEasterEgg(false);
    audioEngine.playFX('rewind');
  };

  // Determine how many stickers to show based on density slider
  const visibleCount = Math.max(1, Math.round((density / 100) * stickers.length));
  const activeStickers = stickers.slice(0, visibleCount);

  return (
    <section className="relative w-full bg-[#111111] text-black border-b-2 border-black overflow-hidden select-none">
      {/* Top Raw Metadata Ticker Strip */}
      <div className="border-b border-black/20 bg-[#F2F0EB] px-4 md:px-8 py-2 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-black/80 z-20 relative">
        <div className="flex items-center gap-3">
          <span className="font-bold text-black uppercase tracking-wider">
            [TRANSMITTING 24/7]
          </span>
          <span>·</span>
          <span>LIVE RELAY: IBIZA GLOBAL RADIO</span>
          <span>·</span>
          <span>104.5 MHz SAT-LINK</span>
        </div>
        <div className="flex items-center gap-4">
          <span>BERLIN: 52°31'N</span>
          <span>IBIZA: 38°54'N</span>
          <span>BROOKLYN: 40°43'N</span>
        </div>
      </div>

      {/* Main Interactive Billboard Area */}
      <div
        onClick={handleBillboardClick}
        className={`relative min-h-[560px] md:min-h-[640px] flex flex-col justify-center px-4 md:px-12 py-16 cursor-${
          slapMode ? 'crosshair' : 'default'
        } overflow-hidden`}
      >
        {/* Full Sticker Collage Background Image (from user request) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/src/assets/images/hero_custom_bg.jpg"
            alt="Underground Radio Authentic Sticker Collage Background"
            className="w-full h-full object-cover object-center scale-105"
            style={{ opacity: bgOpacity / 100 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://i.ibb.co/W4GkbsJH/Gemini-Generated-Image-f5pirvf5pirvf5pi.jpg';
            }}
          />

          {/* Semi-translucent industrial scrim to guarantee high text legibility */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />
          
          {/* Subtle noise/halftone dot print texture */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(circle, #000 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Giant Brutalist Typo Slogan with High Contrast Solid Backing */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="inline-block bg-black text-white px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase mb-4 sticker-shadow">
            INDEPENDENT BROADCAST COMMUNITY // NO ADVERTISING
          </div>

          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.92] uppercase text-black">
            <span className="bg-white/95 text-black px-3.5 py-1 box-decoration-clone inline-block sticker-shadow mb-1">
              WE ARE THE
            </span>
            <br />
            <span className="bg-yellow-400 text-black px-4 py-1 italic box-decoration-clone inline-block sticker-shadow mb-1">
              KONTROLL
            </span>
            <br />
            <span className="bg-black text-white px-3.5 py-1 box-decoration-clone inline-block sticker-shadow">
              FREQUENCY
            </span>
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/95 border-2 border-black p-5 md:p-6 sticker-shadow backdrop-blur-sm max-w-4xl">
            <p className="font-mono text-xs sm:text-sm text-black/90 max-w-xl leading-relaxed">
              Subversive audio feeds broadcasted live from shipping containers & underground
              booths. Live satellite relay from Ibiza Global Radio combined with Berlin tape
              archives, raw dubplates, and real studio cameras.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onTuneIn}
                className="px-6 py-3.5 bg-black text-white hover:bg-yellow-400 hover:text-black font-mono text-xs font-bold tracking-wider uppercase transition-colors sticker-shadow flex items-center gap-2"
              >
                <Volume2 size={16} />
                <span>{isPlaying ? 'PAUSE BROADCAST' : 'TUNE IN LIVE STREAM'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Interactive Sticker Collage Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {activeStickers.map((s) => {
            return (
              <motion.div
                key={s.id}
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                dragElastic={0.2}
                whileHover={{ scale: 1.08, rotate: s.rotation + 3 }}
                whileTap={{ scale: 0.94 }}
                onClick={(e) => handleStickerClick(e, s)}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: `rotate(${s.rotation}deg)`,
                }}
                className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
              >
                {/* Acid 303 Sticker Style */}
                {s.type === 'acid' && (
                  <div className="px-4 py-3 bg-[#FFE500] text-black border-2 border-black rounded-xl sticker-shadow flex items-center gap-3 font-mono">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-yellow-300 font-black text-xs">
                      ☺
                    </div>
                    <div>
                      <div className="font-display font-black text-base leading-none">
                        {s.text}
                      </div>
                      <div className="text-[9px] font-bold tracking-wider opacity-80">
                        {s.subtext}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stamp Style */}
                {s.type === 'stamp' && (
                  <div className="px-4 py-2 bg-[#00FF66] text-black border-2 border-dashed border-black font-mono text-xs font-black tracking-tight sticker-shadow uppercase">
                    <div>★ {s.text} ★</div>
                    <div className="text-[8px] font-normal tracking-widest">{s.subtext}</div>
                  </div>
                )}

                {/* Vinyl Sticker */}
                {s.type === 'vinyl' && (
                  <div className="w-24 h-24 rounded-full bg-[#111111] border-2 border-white text-white flex flex-col items-center justify-center text-center p-2 sticker-shadow font-mono">
                    <div className="w-4 h-4 rounded-full bg-[#EAE8E2] border border-black mb-1" />
                    <span className="font-display font-black text-[11px] leading-tight text-yellow-400">
                      {s.text}
                    </span>
                    <span className="text-[7px] text-neutral-400">{s.subtext}</span>
                  </div>
                )}

                {/* Tape Hazard */}
                {s.type === 'tape' && (
                  <div className="px-5 py-2 bg-[#FFCC00] text-black border-2 border-black font-display font-black text-xs uppercase sticker-shadow rotate-1 tracking-wider">
                    ⚠ {s.text} · {s.subtext}
                  </div>
                )}

                {/* Graffiti Tag */}
                {s.type === 'graffiti' && (
                  <div className="px-5 py-2.5 bg-[#FF0055] text-white border-2 border-black rounded-lg sticker-shadow font-display font-black text-lg tracking-wider italic">
                    {s.text}
                    <span className="block font-mono text-[8px] not-italic tracking-normal">
                      {s.subtext}
                    </span>
                  </div>
                )}

                {/* Barcode Style */}
                {s.type === 'barcode' && (
                  <div className="px-4 py-2 bg-white text-black border-2 border-black font-mono text-xs sticker-shadow">
                    <div className="font-black tracking-widest">{s.text}</div>
                    <div className="h-4 my-1 flex items-stretch gap-[2px]">
                      {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5].map((w, i) => (
                        <div
                          key={i}
                          style={{ width: `${w}px` }}
                          className="bg-black h-full"
                        />
                      ))}
                    </div>
                    <div className="text-[8px] tracking-tight text-neutral-600">{s.subtext}</div>
                  </div>
                )}

                {/* Badge Style */}
                {s.type === 'badge' && (
                  <div className="px-3 py-2 bg-[#00F0FF] text-black border-2 border-black rounded-md font-mono text-xs font-bold sticker-shadow uppercase">
                    ● {s.text}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Easter Egg Reveal Modal */}
        {scratchedEasterEgg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-30 mt-6 p-4 bg-yellow-300 border-2 border-black font-mono text-xs flex items-center justify-between gap-4 sticker-shadow"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-black" />
              <span>
                <strong>EASTER EGG UNLOCKED:</strong> You uncovered the secret studio door code
                for Berlin Kiosk: <code className="bg-black text-yellow-400 px-1 py-0.5">#303-DUB</code> · Free cassette tape at the merch desk!
              </span>
            </div>
            <button
              onClick={() => setScratchedEasterEgg(false)}
              className="px-2 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] uppercase font-bold"
            >
              CLOSE
            </button>
          </motion.div>
        )}
      </div>

      {/* Interactive Collage Toolbar / Controls */}
      <div className="border-t-2 border-black bg-white px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs z-20 relative">
        <div className="flex flex-wrap items-center gap-6">
          {/* Background Wall Intensity slider */}
          <div className="flex items-center gap-2">
            <ImageIcon size={14} className="text-black" />
            <span className="font-bold uppercase tracking-wider text-black">
              WALL ART:
            </span>
            <input
              type="range"
              min="20"
              max="100"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-20 md:w-28 accent-black cursor-pointer"
              title="Adjust sticker wall intensity"
            />
            <span className="font-bold">{bgOpacity}%</span>
          </div>

          {/* Interactive Stickers Density slider */}
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-black">
              STICKER BOMBS:
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-20 md:w-28 accent-black cursor-pointer"
            />
            <span className="font-bold">({activeStickers.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Slap mode toggle */}
          <button
            onClick={() => {
              setSlapMode(!slapMode);
              audioEngine.playFX('scratch');
            }}
            className={`px-3 py-1.5 border border-black font-bold flex items-center gap-1.5 transition-colors ${
              slapMode ? 'bg-yellow-400 text-black' : 'bg-neutral-100 text-black hover:bg-neutral-200'
            }`}
          >
            <Stamp size={14} />
            <span>{slapMode ? 'CLICK BILLBOARD TO SLAP' : 'STICKER SLAP MODE'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            title="Reset sticker layout"
            className="p-1.5 border border-black text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {lastSlapped && (
        <div className="fixed bottom-24 right-6 z-50 bg-black text-yellow-400 border border-yellow-400 px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-lg">
          + SLAPPED "{lastSlapped}"
        </div>
      )}
    </section>
  );
};
