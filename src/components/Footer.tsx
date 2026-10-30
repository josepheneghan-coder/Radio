import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Download
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showImpressum, setShowImpressum] = useState<boolean>(false);

  // 1-Click PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [installHint, setInstallHint] = useState<string | null>(null);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Detect iOS / iPadOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isApple);

    // 3. Check for early captured beforeinstallprompt
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    const handlePromptReady = () => {
      if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    // 4. Listen for Chrome/Edge/Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. App installed listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPWAInstallPrompt = null;
      setInstallHint('RADIO KONTROLLE wurde erfolgreich installiert.');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDownloadApp = async () => {
    try {
      audioEngine.playFX('sub_drop');
    } catch {
      // safe fallback
    }

    if (isInstalled) {
      setInstallHint('Die App ist bereits auf deinem Gerät installiert.');
      return;
    }

    // 1. Android, Windows, macOS (Chrome / Edge): Immediate native prompt
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt : null);
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.__deferredPWAInstallPrompt = null;
          }
          setInstallHint(null);
        }
        return;
      } catch (err) {
        console.warn('Native prompt error:', err);
      }
    }

    // 2. iPhone / iPad (Safari)
    if (isIOS) {
      setInstallHint('Safari: Tippe unten auf „Teilen“ und danach auf „Zum Home-Bildschirm“.');
      return;
    }

    // 3. Desktop browser without beforeinstallprompt
    setInstallHint('Klicke oben in der Adressleiste auf das Installations-Symbol.');
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs mb-10">
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

        {/* ============================================================== */}
        {/* APPLICATION DOWNLOAD BANNER (Exakt wie im Referenzfoto)       */}
        {/* ============================================================== */}
        <div className="my-8 p-4 sm:p-6 bg-[#0a0a0c] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          {/* Left Block: Color Plastikmann Logo + Brand Identity */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <div className="relative shrink-0 flex items-center justify-center p-1 bg-neutral-950 border border-neutral-800 rounded-lg shadow-[0_0_12px_rgba(231,251,4,0.2)]">
              <img
                src="/assets/bng-logo.svg"
                alt="RADIO KONTROLLE Farb-Icon Plastikmann"
                className="h-8 sm:h-9 w-auto object-contain select-none shrink-0 drop-shadow-[0_0_8px_rgba(231,251,4,0.35)]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-orbitron font-black text-white text-base sm:text-lg tracking-wider leading-none">
                RADIO KONTROLLE
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-neutral-400 uppercase font-semibold mt-1">
                INDIE / UNDERGROUND / LIVE
              </span>
            </div>
          </div>

          {/* Middle Vertical Divider (Desktop) */}
          <div className="hidden md:block w-px h-10 bg-neutral-800 shrink-0" aria-hidden="true" />

          {/* Right Block: Headline, Description & Yellow Download Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs sm:text-[13px] text-white tracking-wider uppercase">
                JETZT AUCH ALS APP
              </span>
              <span className="font-mono text-[10.5px] sm:text-[11.5px] text-neutral-400 mt-0.5">
                Unsere Radio-App für iOS & Android
              </span>
            </div>

            <div className="flex flex-col sm:items-end w-full sm:w-auto">
              <button
                onClick={handleDownloadApp}
                className="w-full sm:w-auto bg-[#facc15] hover:bg-[#eab308] text-black font-mono font-black text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:shadow-[0_0_20px_rgba(250,204,21,0.45)] cursor-pointer active:scale-95 shrink-0"
                aria-label="RADIO KONTROLLE App downloaden oder installieren"
              >
                {isInstalled ? (
                  <>
                    <Check size={16} className="stroke-[3]" />
                    <span>APP BEREITS INSTALLIERT</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="stroke-[2.5]" />
                    <span>APP DOWNLOADEN</span>
                  </>
                )}
              </button>

              {installHint && (
                <div className="mt-2 text-[11px] font-mono text-yellow-300 bg-[#141418] border border-neutral-700 px-3 py-1.5 flex items-center justify-between gap-2 rounded max-w-sm">
                  <span>{installHint}</span>
                  <button
                    onClick={() => setInstallHint(null)}
                    className="text-neutral-400 hover:text-white text-xs ml-1 font-bold cursor-pointer"
                    aria-label="Hinweis schließen"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar & Impressum */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <img
              src="/assets/bng-logo.svg"
              alt="RADIO KONTROLLE Logo"
              className="h-5 w-auto object-contain opacity-80"
            />
            <span>© 2026 RADIO KONTROLLE · SUB-FREQUENCY INDEPENDENT BROADCAST.</span>
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
              RADIO KONTROLLE gGmbH i.G. · Holzmarktstraße 25, 10243 Berlin · Vertreten durch: Redaktion & Studio Kollektiv.
              <br />
              Kontakt: studio@radiokontrolle.fm · Lizenzierung: GEMA/GVL gemeldeter Webradio-Sender. Keine kommerzielle Datenweitergabe.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
