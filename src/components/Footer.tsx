import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Laptop, 
  X,
  Radio
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showImpressum, setShowImpressum] = useState<boolean>(false);

  // PWA Install / App Download State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect if already installed or running as standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Chrome/Edge/Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDownloadApp = async () => {
    audioEngine.playFX('sub_drop');

    // 1. If native beforeinstallprompt is ready (Chrome, Edge, Android)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return;
      } catch {
        // Fallback to instruction modal on error
      }
    }

    // 2. Otherwise open universal guided install modal (iOS Safari, Desktop, etc.)
    setShowInstallModal(true);
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

            <button
              onClick={handleDownloadApp}
              className="w-full sm:w-auto bg-[#facc15] hover:bg-[#eab308] text-black font-mono font-black text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:shadow-[0_0_20px_rgba(250,204,21,0.45)] cursor-pointer active:scale-95 shrink-0"
              aria-label="RADIO KONTROLLE App downloaden oder installieren"
            >
              <Download size={16} className="stroke-[2.5]" />
              <span>{isInstalled ? 'APP BEREITS INSTALLIERT' : 'APP DOWNLOADEN'}</span>
            </button>
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

      {/* ============================================================== */}
      {/* PWA / APP INSTALL INSTRUCTIONS MODAL                           */}
      {/* ============================================================== */}
      {showInstallModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
          onClick={() => setShowInstallModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#0c0c10] border-2 border-[#facc15] shadow-[0_0_40px_rgba(250,204,21,0.25)] text-white font-mono p-5 sm:p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Farb-Icon Plastikmann ganz oben drauf */}
            <div className="flex items-start justify-between gap-4 border-b border-[#242432] pb-4 mb-4">
              <div className="flex items-center gap-3.5">
                {/* Offizielles Farb-Icon des Plastikmanns als App-Tile */}
                <div className="relative shrink-0">
                  <img
                    src="/assets/kontrolle-color-icon.svg"
                    alt="RADIO KONTROLLE Plastikmann Farb-Icon"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(231,251,4,0.35)] object-contain bg-[#09090d]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full border border-black shadow">
                    <Download size={12} className="stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="bg-yellow-400 text-black px-1.5 py-0.2 text-[9px] font-mono font-black uppercase tracking-wider">
                      OFFIZIELLE APP
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      HOME-SCREEN ICON
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-wider leading-tight">
                    RADIO KONTROLLE
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Mit dem originalen Plastikmann Farb-Icon auf deinem Gerät
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-[#181824] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#2b2b3d] transition-colors cursor-pointer shrink-0"
                aria-label="Modal schließen"
              >
                <X size={16} />
              </button>
            </div>

            {/* Platform Guides */}
            <div className="space-y-4 text-xs">
              {/* iOS Safari Guide */}
              <div className={`p-3.5 border ${isIOS ? 'border-yellow-400/80 bg-neutral-900/90' : 'border-[#222230] bg-[#121216]'}`}>
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Smartphone size={16} className="text-yellow-400" />
                  <span>AUF IPHONE & IPAD (SAFARI):</span>
                  {isIOS && <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 font-black">DEIN GERÄT</span>}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-[11px]">
                  <li>
                    Tippe unten in Safari auf das <strong className="text-white inline-flex items-center gap-1 mx-1"><Share2 size={12} /> Teilen-Symbol</strong> (Viereck mit Pfeil).
                  </li>
                  <li>
                    Scrolle in den Optionen nach unten und wähle <strong className="text-white inline-flex items-center gap-1 mx-1"><PlusSquare size={12} /> Zum Home-Bildschirm</strong>.
                  </li>
                  <li>
                    Tippe oben rechts auf <strong>„Hinzufügen“</strong>. Die App startet nun wie eine native App ohne Adressleiste!
                  </li>
                </ol>
              </div>

              {/* Android & Chrome Guide */}
              <div className={`p-3.5 border ${!isIOS ? 'border-yellow-400/80 bg-neutral-900/90' : 'border-[#222230] bg-[#121216]'}`}>
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Smartphone size={16} className="text-yellow-400" />
                  <span>AUF ANDROID & CHROME:</span>
                  {!isIOS && <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 font-black">EMPFOHLEN</span>}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-[11px]">
                  <li>
                    Tippe oben rechts auf das <strong className="text-white">Dreipunkte-Menü (⋮)</strong>.
                  </li>
                  <li>
                    Wähle <strong className="text-white">„App installieren“</strong> oder <strong className="text-white">„Zum Startbildschirm hinzufügen“</strong>.
                  </li>
                  <li>
                    Bestätige die Installation.
                  </li>
                </ol>
              </div>

              {/* Desktop Browser Guide */}
              <div className="p-3 border border-[#222230] bg-[#121216]">
                <div className="flex items-center gap-2 font-bold text-neutral-300 mb-1.5 text-[11px]">
                  <Laptop size={14} className="text-neutral-400" />
                  <span>DESKTOP (CHROME / EDGE):</span>
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  Klicke in der Adressleiste oben rechts auf das kleine <strong>Installieren-Icon</strong> (Monitor mit Pfeil nach unten).
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="mt-5 pt-3 border-t border-[#20202a] flex justify-end">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold uppercase text-xs cursor-pointer transition-colors"
              >
                VERSTANDEN
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
