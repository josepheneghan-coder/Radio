/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { ShowsArchiveGrid } from './components/ShowsArchiveGrid';
import { ScheduleTimetable } from './components/ScheduleTimetable';
import { MerchSection } from './components/MerchSection';
import { AboutManifesto } from './components/AboutManifesto';
import { Footer } from './components/Footer';
import { UndergroundReactor } from './components/UndergroundReactor';
import { LiveEventTicker } from './components/LiveEventTicker';
import { DispatchLog } from './components/DispatchLog';
import { HeroRadioPlayer } from './components/HeroRadioPlayer';
import { StudioSurveillance } from './components/StudioSurveillance';
import { TracklistModal } from './components/TracklistModal';
import { CHANNELS, SHOWS_DATA } from './data/radioData';
import { Channel, Show, StreamStatus } from './types/radio';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('standby');
  const [statusMessage, setStatusMessage] = useState<string>('STANDBY · SIGNAL READY');
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [selectedShowForModal, setSelectedShowForModal] = useState<Show | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);
  const heroZoneRef = React.useRef<HTMLDivElement>(null);

  // Monitor Hero visibility via IntersectionObserver:
  // Bottom player is hidden on Desktop while Hero START button is in view,
  // and smoothly slides in when the visitor scrolls down past the hero zone.
  useEffect(() => {
    document.title = 'GLOBAL RADIO';

    const target = heroZoneRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Subscribe to audio engine state
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, status, msg) => {
      setIsPlaying(playing);
      setStreamStatus(status);
      if (msg) setStatusMessage(msg);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // MediaSession strictly displays exclusively GLOBAL RADIO on lock screens without subtitles
  useEffect(() => {
    audioEngine.setTrackInfo({
      title: 'GLOBAL RADIO',
      artist: '',
      album: '',
    });
  }, [activeChannel]);

  // Keyboard controls: Space to play/pause, M to mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key.toLowerCase() === 'm') {
        const muted = audioEngine.toggleMute();
        setIsMuted(muted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChannel, isPlaying]);

  // Handlers
  const handleTogglePlay = () => {
    if (!isPlaying) {
      audioEngine.requestWakeLock().catch(() => {});
    }
    audioEngine.togglePlay(activeChannel.streamUrl);
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    if (isPlaying) {
      if (channel.streamUrl) {
        audioEngine.startStream(channel.streamUrl);
      } else {
        audioEngine.stop();
      }
    }
  };

  const handleOpenShowDetail = (show: Show) => {
    setSelectedShowForModal(show);
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'hero' || sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-ui selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* Fixed Top Header */}
      <Header
        isPlaying={isPlaying}
        streamStatus={streamStatus}
        onTogglePlay={handleTogglePlay}
        activeChannel={activeChannel}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSoundboard={() => {}}
        onNavigate={handleNavigate}
      />

      {/* Main Content Sections: Exact layout order */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top Hero Zone: Ticker, Visualizer Reactor, CCTV Studio Feed & Primary START Player */}
        <div ref={heroZoneRef} className="hero-zone-standalone">
          {/* 1. Live Event Ticker & Banner */}
          <LiveEventTicker onNavigate={handleNavigate} />

          {/* 2. Equalizer Visualizer (Pure Animation — No text, No dB scales, No controls) */}
          <UndergroundReactor
            isPlaying={isPlaying}
            streamStatus={streamStatus}
          />

          {/* 3. High-Density 2-Column Broadcast Suite (CCTV Studio-Bild & Dispatch Log) */}
          <section className="w-full bg-[#070709] border-b border-[#1c1c24] py-3 sm:py-4 px-2 sm:px-4 md:px-6 select-none hero-broadcast-suite-standalone">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
                {/* Left Column (ca. 7 cols): Studio-Bild (CCTV) + Musik-Player mit START-Button direkt darunter */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <StudioSurveillance
                    channel={activeChannel}
                    isPlaying={isPlaying}
                    streamStatus={streamStatus}
                    onOpenTracklistModal={() => setSelectedShowForModal(SHOWS_DATA[0])}
                  />
                  <HeroRadioPlayer
                    isPlaying={isPlaying}
                    streamStatus={streamStatus}
                    activeChannel={activeChannel}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>

                {/* Right Column (ca. 5 cols): Dispatch Log */}
                <div className="lg:col-span-5 flex flex-col">
                  <DispatchLog className="h-full" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Shows & Radio Picks Archive Grid */}
        <ShowsArchiveGrid
          onOpenShowDetail={handleOpenShowDetail}
        />

        {/* Schedule & Daily Transmission Timetable */}
        <ScheduleTimetable onTuneInLive={handleTogglePlay} isPlaying={isPlaying} />

        {/* Merch & Vinyl Supply Section */}
        <MerchSection />

        {/* Independent Radio Manifesto & Studio Specs */}
        <AboutManifesto />
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Floating Bottom Audio Player (Smoothly reveals on desktop once scrolled past the hero area) */}
      <PersistentAudioPlayer
        isPlaying={isPlaying}
        streamStatus={streamStatus}
        statusMessage={statusMessage}
        onTogglePlay={handleTogglePlay}
        activeChannel={activeChannel}
        onChangeChannel={handleSelectChannel}
        showOnDesktop={!isHeroVisible}
      />

      {/* Tracklist Details Modal */}
      {selectedShowForModal && (
        <TracklistModal
          show={selectedShowForModal}
          onClose={() => setSelectedShowForModal(null)}
        />
      )}
    </div>
  );
}
