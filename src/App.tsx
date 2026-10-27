/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveBoothStream } from './components/LiveBoothStream';
import { ShowsArchiveGrid } from './components/ShowsArchiveGrid';
import { ScheduleTimetable } from './components/ScheduleTimetable';
import { MerchSection } from './components/MerchSection';
import { AboutManifesto } from './components/AboutManifesto';
import { Footer } from './components/Footer';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { UndergroundReactor } from './components/UndergroundReactor';
import { LiveEventTicker } from './components/LiveEventTicker';
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

      {/* Main Content Sections: Live Event Ticker above Underground Reactor */}
      <main className="flex-1 overflow-x-hidden">
        {/* Global Verified Electronic Music Live Event Ticker */}
        <LiveEventTicker onNavigate={handleNavigate} />

        {/* 1. Master Audio Reactor & Equalizer (Mobile-First: Music First) */}
        <UndergroundReactor
          isPlaying={isPlaying}
          streamStatus={streamStatus}
          onTogglePlay={handleTogglePlay}
        />

        {/* 2. Community Dispatch Log & Studio Surveillance Cam */}
        <LiveBoothStream
          channel={activeChannel}
          isPlaying={isPlaying}
          streamStatus={streamStatus}
          onTogglePlay={handleTogglePlay}
          onOpenTracklistModal={() => setSelectedShowForModal(SHOWS_DATA[0])}
        />

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

      {/* Persistent Floating Bottom Audio Player */}
      <PersistentAudioPlayer
        isPlaying={isPlaying}
        streamStatus={streamStatus}
        statusMessage={statusMessage}
        onTogglePlay={handleTogglePlay}
        activeChannel={activeChannel}
        onChangeChannel={handleSelectChannel}
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
