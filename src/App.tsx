/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroCollage } from './components/HeroCollage';
import { LiveBoothStream } from './components/LiveBoothStream';
import { ShowsArchiveGrid } from './components/ShowsArchiveGrid';
import { ScheduleTimetable } from './components/ScheduleTimetable';
import { MerchSection } from './components/MerchSection';
import { AboutManifesto } from './components/AboutManifesto';
import { Footer } from './components/Footer';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { TracklistModal } from './components/TracklistModal';
import { CHANNELS, SHOWS_DATA } from './data/radioData';
import { Channel, Show, StreamStatus } from './types/radio';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [activeShowId, setActiveShowId] = useState<string | null>(null);
  const [selectedShowForModal, setSelectedShowForModal] = useState<Show | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Subscribe to audio engine state (both real stream & synth events)
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, status) => {
      setIsPlaying(playing);
      setStreamStatus(status);
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
    if (isPlaying) {
      audioEngine.stop();
    } else {
      if (activeChannel.sourceType === 'stream' && activeChannel.streamUrl) {
        audioEngine.startStream(activeChannel.streamUrl);
      } else {
        const preset =
          activeChannel.id === 'ch2' ? 'dub' : activeChannel.id === 'ch3' ? 'acid' : 'synth';
        audioEngine.startSynth(preset);
      }
    }
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setActiveShowId(null);
    if (channel.sourceType === 'stream' && channel.streamUrl) {
      audioEngine.startStream(channel.streamUrl);
    } else {
      const preset = channel.id === 'ch2' ? 'dub' : channel.id === 'ch3' ? 'acid' : 'synth';
      audioEngine.startSynth(preset);
    }
  };

  const handlePlayShow = (show: Show) => {
    setActiveShowId(show.id);
    const updatedChannel: Channel = {
      id: 'ch1',
      name: `ARCHIVE: ${show.title}`,
      frequency: '104.5 FM',
      currentShow: show.title,
      dj: show.host,
      genre: show.genres.join(' · '),
      location: show.location,
      bitrate: '320 kbps Master Tape',
      sourceType: 'synth',
    };
    setActiveChannel(updatedChannel);
    audioEngine.startSynth(show.audioPreset === 'stream' ? 'synth' : show.audioPreset);
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
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

      {/* Hero Section with Brutalist Typo and Interactive Sticker Collage */}
      <main className="flex-1">
        <HeroCollage onTuneIn={handleTogglePlay} isPlaying={isPlaying} />

        {/* Live DJ Booth Surveillance Stream & Shoutbox */}
        <LiveBoothStream
          channel={activeChannel}
          isPlaying={isPlaying}
          streamStatus={streamStatus}
          onTogglePlay={handleTogglePlay}
          onOpenTracklistModal={() => setSelectedShowForModal(SHOWS_DATA[0])}
        />

        {/* Shows & Radio Picks Archive Grid */}
        <ShowsArchiveGrid
          onPlayShow={handlePlayShow}
          activeShowId={activeShowId}
          isPlaying={isPlaying}
          onOpenShowDetail={(show) => setSelectedShowForModal(show)}
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
        onTogglePlay={handleTogglePlay}
        activeChannel={activeChannel}
        onChangeChannel={handleSelectChannel}
      />

      {/* Tracklist Details Modal */}
      {selectedShowForModal && (
        <TracklistModal
          show={selectedShowForModal}
          onClose={() => setSelectedShowForModal(null)}
          onPlayShow={handlePlayShow}
          isPlaying={isPlaying}
          activeShowId={activeShowId}
        />
      )}
    </div>
  );
}
