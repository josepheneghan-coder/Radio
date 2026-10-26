import React, { useState } from 'react';
import { Mail, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showImpressum, setShowImpressum] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubscribed(true);
    audioEngine.playFX('radio_drop');
  };

  return (
    <footer className="w-full bg-[#000000] text-white pt-20 pb-28 px-4 md:px-8 border-t-2 border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Giant Typo Newsletter Slogan */}
        <div className="mb-14 pb-12 border-b border-neutral-800">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">
            WEEKLY UNDERGROUND DISPATCH · DIRECT CASSETTE ARCHIVE
          </div>
          <h2 className="font-display font-black text-section-display uppercase leading-[0.9] tracking-[-0.035em]">
            STAY UPDATED.
            <br />
            <span className="text-neutral-500 hover:text-white transition-colors">
              RECEIVE THE TAPES.
            </span>
          </h2>

          <div className="mt-8 max-w-xl">
            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email address..."
                  required
                  className="flex-1 min-h-[48px] bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm font-ui text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="min-h-[48px] px-6 py-3 bg-white text-black hover:bg-neutral-200 font-ui font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white"
                >
                  <span>SUBSCRIBE</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-neutral-950 border border-neutral-700 font-mono text-xs text-white flex flex-col gap-1">
                <div className="flex items-center gap-2 font-bold text-yellow-400">
                  <Check size={16} />
                  <span>SUBSCRIPTION CONFIRMED · DISPATCH CODE KNT-SUB</span>
                </div>
                <p className="text-neutral-400 text-[11px] font-ui">
                  Weekly secret cassette rips, unlisted sets, and booth guestlists will be sent to <strong>{email}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4 Column Info & Studio Locations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs mb-14">
          {/* Studio 1 */}
          <div>
            <h4 className="font-bold text-white uppercase mb-2 text-sm text-yellow-400">
              BERLIN STUDIO
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              Holzmarktstraße 25
              <br />
              10243 Berlin-Friedrichshain
              <br />
              Kiosk Container #04
              <br />
              Broadcasting on 104.5 MHz
            </p>
          </div>

          {/* Studio 2 */}
          <div>
            <h4 className="font-bold text-white uppercase mb-2 text-sm text-yellow-400">
              BROOKLYN KIOSK
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              Franklin Street / Greenpoint
              <br />
              Brooklyn, NY 11222
              <br />
              Outdoor Booth Open Daily
              <br />
              Broadcasting on 92.1 MHz
            </p>
          </div>

          {/* Studio 3 */}
          <div>
            <h4 className="font-bold text-white uppercase mb-2 text-sm text-yellow-400">
              LONDON VAULT
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              White Post Lane
              <br />
              Hackney Wick, London E9 5EN
              <br />
              Sub-Level 2
              <br />
              Broadcasting on 107.8 MHz
            </p>
          </div>

          {/* Socials & Networks */}
          <div>
            <h4 className="font-bold text-white uppercase mb-2 text-sm text-yellow-400">
              COMMUNITY LINKS
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <a
                  href="https://soundcloud.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>SoundCloud Archives</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Instagram Live Cam</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>YouTube 24/7 Stream</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://bandcamp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Bandcamp Cassette Club</span>
                  <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Impressum */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div>
            © 2026 KONTROLL RADIO · SUB-FREQUENCY INDEPENDENT BROADCAST.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowImpressum(!showImpressum)}
              className="hover:text-white underline cursor-pointer"
            >
              Impressum & Privacy
            </button>
            <span>·</span>
            <span>STREAM SPECS: ICECAST 2.4 / 320 KBPS</span>
          </div>
        </div>

        {/* Impressum Modal / Dropdown */}
        {showImpressum && (
          <div className="mt-6 p-4 bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-400">
            <div className="font-bold text-white mb-1">ANGABEN GEMÄSS § 5 TMG / IMPRESSUM:</div>
            <p>
              KONTROLL Radio gGmbH i.G. · Holzmarktstraße 25, 10243 Berlin · Vertreten durch: Redaktion & Studio Kollektiv.
              <br />
              Kontakt: studio@kontroll-radio.fm · Lizenzierung: GEMA/GVL gemeldeter Webradio-Sender. Keine kommerzielle Datenweitergabe.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
