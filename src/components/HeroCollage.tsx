import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Stamp, RotateCcw, Volume2, Image as ImageIcon, Flame } from 'lucide-react';
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
    text: 'RADIO KONTROLLE',
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
  const [density, setDensity] = useState<number>(75);
  const [bgStyle, setBgStyle] = useState<'cinematic' | 'stickers'>('cinematic');
  const [bgOpacity, setBgOpacity] = useState<number>(90);
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

  const visibleCount = Math.max(1, Math.round((density / 100) * stickers.length));
  const activeStickers = stickers.slice(0, visibleCount);

  return (
    <section className="relative w-full bg-[#0a0a0a] text-black border-b-2 border-black overflow-hidden select-none">
      {/* Top Raw Metadata Ticker Strip — Technical Broadcast Typography */}
      <div className="border-b border-black/20 bg-[#F2F0EB] px-3 sm:px-6 md:px-8 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-black/85 z-20 relative">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-bold text-black uppercase tracking-widest">
            [TRANSMISSION 24/7]
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-black/80 font-semibold uppercase">
            RADIO KONTROLLE · SUB-FREQUENCY AUDIO
          </span>
          <span>·</span>
          <span className="font-semibold text-neutral-800">104.5 MHz SATELLITE RELAY</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-black/70">
          <span>BERLIN: 52°31'N</span>
          <span>NEW YORK: 40°43'N</span>
          <span>LONDON: 51°32'N</span>
        </div>
      </div>

      {/* Main Interactive Billboard Area */}
      <div
        onClick={handleBillboardClick}
        className={`relative min-h-[480px] sm:min-h-[580px] md:min-h-[660px] flex flex-col justify-center px-4 sm:px-8 md:px-12 py-10 sm:py-16 cursor-${
          slapMode ? 'crosshair' : 'default'
        } overflow-hidden`}
      >
        {/* Cinematic Club Temple Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-black">
          {bgStyle === 'cinematic' ? (
            <img
              src="/images/banner_club.jpg"
              alt="Berlin Underground Cinematic Club Volumetric Lasers"
              className="w-full h-full object-cover object-[center_35%] sm:object-center scale-100 transition-opacity duration-500"
              style={{ opacity: bgOpacity / 100 }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/images/hero_custom_bg.jpg';
              }}
            />
          ) : (
            <img
              src="/images/hero_custom_bg.jpg"
              alt="Underground Radio Authentic Sticker Collage Background"
              className="w-full h-full object-cover object-center scale-100 transition-opacity duration-500"
              style={{ opacity: bgOpacity / 100 }}
            />
          )}

          {/* Contrast Gradients for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80 pointer-events-none" />

          {/* Subtle Halftone Matrix */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Monumental Club Typography — Refined Editorial Direction */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Top Architectural Station Tag */}
          <div className="inline-flex items-center gap-2.5 bg-black/90 text-neutral-300 border border-neutral-700/80 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase mb-4 sm:mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-red-600 shrink-0" />
            <span>INDEPENDENT BROADCAST STATION · BERLIN</span>
            <span className="text-neutral-500">·</span>
            <span className="text-yellow-400">104.5 MHz</span>
          </div>

          {/* Monumental Display Headline */}
          <h1 className="font-display font-black text-hero-fluid uppercase text-white tracking-[-0.04em] select-none max-w-5xl leading-[0.88] drop-shadow-md">
            <span>RADIO KONTROLLE</span>
            <span className="text-yellow-400 block tracking-[-0.045em]">
              SUB-FREQUENCY
            </span>
            <span className="text-neutral-400 block text-[clamp(1.75rem,5.2vw,4.6rem)] tracking-[-0.035em] font-extrabold mt-1">
              RADIO SYSTEM
            </span>
          </h1>

          {/* Subheading & Action Block */}
          <div className="mt-8 sm:mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0e0e0e]/95 border border-neutral-700/80 p-5 sm:p-7 backdrop-blur-md max-w-4xl">
            <div className="max-w-xl">
              <p className="font-ui text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Transmitting raw underground club soundscapes live from industrial shipping
                containers and satellite relays. Direct vinyl sets, tape archives,
                exclusive dubplates, and uncompressed 24/7 booth surveillance.
              </p>
              <div className="mt-3 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-yellow-400/90">
                <span>ICECAST 2.4</span>
                <span>·</span>
                <span>320 KBPS OPUS & MP3</span>
                <span>·</span>
                <span>LOSSLESS CARRIER</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onTuneIn}
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-white text-black hover:bg-yellow-400 font-ui font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2.5 cursor-pointer border border-white"
              >
                <Volume2 size={16} />
                <span>{isPlaying ? 'PAUSE TRANSMISSION' : 'TUNE IN TRANSMISSION'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Interactive Club Ephemera Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {activeStickers.map((s) => {
            return (
              <motion.div
                key={s.id}
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                dragElastic={0.2}
                whileHover={{ scale: 1.05, rotate: s.rotation + 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleStickerClick(e, s)}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: `rotate(${s.rotation}deg)`,
                }}
                className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none scale-75 sm:scale-100 hidden sm:block md:block"
              >
                {/* Acid 303 Cutoff Ephemera */}
                {s.type === 'acid' && (
                  <div className="px-3.5 py-2.5 bg-[#FFE500] text-black border-2 border-black font-mono shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between gap-3 border-b border-black pb-1 mb-1">
                      <span className="font-display font-black text-xs tracking-tight">ROLAND TB-303</span>
                      <span className="text-[9px] font-bold">104.5 MHz</span>
                    </div>
                    <div className="font-display font-black text-sm leading-tight tracking-tight">
                      {s.text}
                    </div>
                    <div className="text-[8px] font-semibold tracking-wider opacity-90 mt-0.5">
                      {s.subtext}
                    </div>
                  </div>
                )}

                {/* Dispatch Stamp Style */}
                {s.type === 'stamp' && (
                  <div className="px-3.5 py-1.5 bg-[#EAE8E2] text-black border border-black font-mono text-xs font-black tracking-tight shadow-[2px_2px_0px_#000] uppercase">
                    <div className="text-[10px] tracking-widest text-neutral-600">STATION DISPATCH</div>
                    <div className="font-bold">{s.text}</div>
                    <div className="text-[7.5px] font-normal tracking-wider opacity-75">{s.subtext}</div>
                  </div>
                )}

                {/* 33 RPM Vinyl Label */}
                {s.type === 'vinyl' && (
                  <div className="w-22 h-22 rounded-full bg-[#111111] border border-neutral-600 text-white flex flex-col items-center justify-center text-center p-2 font-mono shadow-[2px_2px_0px_#000]">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EAE8E2] border border-black mb-1" />
                    <span className="font-display font-black text-[10px] leading-tight text-white tracking-tight">
                      {s.text}
                    </span>
                    <span className="text-[7px] text-neutral-400 mt-0.5">{s.subtext}</span>
                  </div>
                )}

                {/* Revox Tape Calibration Strip */}
                {s.type === 'tape' && (
                  <div className="px-4 py-1.5 bg-white text-black border-2 border-black font-mono text-[10px] uppercase shadow-[2px_2px_0px_#000] tracking-wider">
                    <span className="font-black">REVOX B77</span> · 15 IPS HIGH BIAS
                  </div>
                )}

                {/* Station Monogram Tag */}
                {s.type === 'graffiti' && (
                  <div className="px-4 py-2 bg-[#E60000] text-white border-2 border-black shadow-[2px_2px_0px_#000] font-display font-black text-sm tracking-wider">
                    {s.text}
                    <span className="block font-mono text-[8px] not-italic tracking-wider uppercase font-semibold text-white/90">
                      {s.subtext}
                    </span>
                  </div>
                )}

                {/* Archive Barcode */}
                {s.type === 'barcode' && (
                  <div className="px-3 py-1.5 bg-white text-black border border-black font-mono text-[10px] shadow-[2px_2px_0px_#000]">
                    <div className="font-black tracking-widest">{s.text}</div>
                    <div className="h-3 my-1 flex items-stretch gap-[2px]">
                      {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5].map((w, i) => (
                        <div key={i} style={{ width: `${w}px` }} className="bg-black h-full" />
                      ))}
                    </div>
                    <div className="text-[7px] tracking-wider text-neutral-600">{s.subtext}</div>
                  </div>
                )}

                {/* Badge Style */}
                {s.type === 'badge' && (
                  <div className="px-3 py-1 bg-neutral-900 text-yellow-400 border border-neutral-700 font-mono text-[10px] font-bold shadow-[2px_2px_0px_#000] uppercase">
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
              <Sparkles size={18} className="text-black shrink-0" />
              <span>
                <strong>EASTER EGG UNLOCKED:</strong> Secret studio door code for Berlin Kiosk: <code className="bg-black text-yellow-400 px-1 py-0.5">#303-DUB</code> · Free cassette tape at the merch desk!
              </span>
            </div>
            <button
              onClick={() => setScratchedEasterEgg(false)}
              className="px-2 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] uppercase font-bold cursor-pointer"
            >
              CLOSE
            </button>
          </motion.div>
        )}
      </div>

      {/* Interactive Toolbar & Background Switcher */}
      <div className="border-t-2 border-black bg-white px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 font-mono text-xs z-20 relative">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {/* Background Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 border border-neutral-300 font-ui font-semibold text-[11px]">
            <button
              onClick={() => {
                setBgStyle('cinematic');
                audioEngine.playFX('scratch');
              }}
              className={`px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                bgStyle === 'cinematic'
                  ? 'bg-black text-white font-bold'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Flame size={12} />
              <span>VENUE FEED</span>
            </button>
            <button
              onClick={() => {
                setBgStyle('stickers');
                audioEngine.playFX('scratch');
              }}
              className={`px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                bgStyle === 'stickers'
                  ? 'bg-black text-white font-bold'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <ImageIcon size={12} />
              <span>COLLAGE VIEW</span>
            </button>
          </div>

          {/* Wall Opacity Slider */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-black text-[11px]">
              EXPOSURE:
            </span>
            <input
              type="range"
              min="30"
              max="100"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-16 md:w-24 accent-black cursor-pointer"
              title="Adjust background exposure"
            />
            <span className="font-bold text-[11px] tabular-nums">{bgOpacity}%</span>
          </div>

          {/* Interactive Stickers Density slider */}
          <div className="hidden md:flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-black text-[11px]">
              EPHEMERA:
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-16 md:w-24 accent-black cursor-pointer"
            />
            <span className="font-bold text-[11px] tabular-nums">({activeStickers.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Slap mode toggle */}
          <button
            onClick={() => {
              setSlapMode(!slapMode);
              audioEngine.playFX('scratch');
            }}
            className={`min-h-[34px] px-3.5 py-1 border border-black font-ui font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              slapMode ? 'bg-yellow-400 text-black' : 'bg-neutral-100 text-black hover:bg-neutral-200'
            }`}
          >
            <Stamp size={13} />
            <span>{slapMode ? 'CLICK TO PLACE' : 'ADD EPHEMERA'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            title="Reset ephemera layout"
            className="w-8 h-8 flex items-center justify-center border border-black text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {lastSlapped && (
        <div className="fixed bottom-24 right-4 z-50 bg-black text-yellow-400 border border-yellow-400 px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-xl animate-in fade-in">
          + SLAPPED "{lastSlapped}"
        </div>
      )}
    </section>
  );
};
