import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryCharging,
  Volume2,
  VolumeX,
  Search,
  Settings,
  Cloud,
  Gamepad2,
  Binary,
  Smartphone,
  Layers,
  Sparkles,
  Disc3,
  Music,
  EyeOff,
  Github,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TopNavProps {
  currentTab: 'ps5_home' | 'library' | 'cloud' | 'hex' | 'devices' | 'game';
  onSelectTab: (tab: 'ps5_home' | 'library' | 'cloud' | 'hex' | 'devices' | 'game') => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  pendingCount: number;
  onOpenStealthVault?: () => void;
  concealedCount?: number;
  onOpenGitHubArt?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onSyncAll,
  isSyncing,
  pendingCount,
  onOpenStealthVault,
  concealedCount = 0,
  onOpenGitHubArt,
}) => {
  const [timeString, setTimeString] = useState('');
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(sound.isAmbientPlaying);

  // Live PS5 clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    sound.playPS5Click();
    const muted = sound.toggleMute();
    setIsMuted(muted);
    setIsAmbientPlaying(sound.isAmbientPlaying);
  };

  const handleAmbientToggle = () => {
    sound.playPS5Click();
    const playing = sound.toggleAmbientMusic();
    setIsAmbientPlaying(playing);
  };

  const handleTabClick = (tab: typeof currentTab) => {
    sound.playPS5Focus();
    onSelectTab(tab);
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 shrink-0 select-none z-30">
      {/* Zone 1: PS5 Logo & Category Tabs */}
      <div className="flex items-center gap-6">
        {/* PS5 Brand Emblem App Logo */}
        <button
          onClick={() => handleTabClick('ps5_home')}
          className="flex items-center gap-2.5 group text-white hover:text-sky-400 transition-colors"
          title="PlayStation 5 Console Home"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.45)] shrink-0 group-hover:scale-105 transition-transform bg-slate-950">
            <img
              src="/assets/aistudio/1793288020920_0f8a499b.jpg"
              alt="SaveSync PS5 App Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
            PlayStation<span className="text-sky-400 font-normal ml-0.5">5</span>
          </span>
        </button>

        {/* PS5 Main Category Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-400">
          <button
            onClick={() => handleTabClick('ps5_home')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'ps5_home' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <span>Home</span>
            {currentTab === 'ps5_home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('library')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'library' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <span>Game Library</span>
            {currentTab === 'library' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('cloud')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'cloud' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <span>Cloud Sync</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            {currentTab === 'cloud' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('hex')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'hex' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <span>Hex Memory</span>
            {currentTab === 'hex' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('devices')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'devices' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <span>Consoles & Handhelds</span>
            {currentTab === 'devices' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('game')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'game' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Play Sandbox</span>
            {currentTab === 'game' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>
        </nav>
      </div>

      {/* Zone 3: PS5 Utility Cluster & User Profile */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-300 shrink-0">
        {/* Network & Cloud Status */}
        <div
          className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[11px]"
          title="PlayStation Network / Google Drive Cloud Sync Active"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline text-slate-400">CLOUD ONLINE</span>
        </div>

        {/* Android Stealth Space / Home Concealment Button */}
        {onOpenStealthVault && (
          <button
            onClick={() => {
              sound.playPS5Click();
              onOpenStealthVault();
            }}
            className="flex items-center gap-1.5 bg-purple-950/40 hover:bg-purple-900/50 px-2.5 py-1 rounded-full border border-purple-800/60 text-[11px] text-purple-200 transition-all shadow-[0_0_8px_rgba(168,85,247,0.15)] hover:border-purple-500/60"
            title="Android Home Screen Concealment: Stealth Space Manager"
          >
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Stealth Vault</span>
            <span className="bg-purple-800/70 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
              {concealedCount}
            </span>
          </button>
        )}

        {/* GitHub Emulator Art & Backdrop Auto-Download */}
        {onOpenGitHubArt && (
          <button
            onClick={() => {
              sound.playPS5Click();
              onOpenGitHubArt();
            }}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
            title="GitHub Emulator Art & Background Auto-Sync"
          >
            <Github className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">GitHub Art</span>
          </button>
        )}

        {/* DualSense / Handheld Battery */}
        <div
          className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[11px]"
          title="DualSense Wireless Controller (100% Charged)"
        >
          <BatteryCharging className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline text-slate-300 font-semibold">100%</span>
        </div>

        {/* PS5 Ambient Backsound Music Toggle */}
        <button
          onClick={handleAmbientToggle}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono transition-all ${
            isAmbientPlaying
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Toggle PlayStation 5 Ambient Backsound Music"
        >
          <Disc3 className={`w-3.5 h-3.5 ${isAmbientPlaying ? 'animate-spin text-sky-400' : ''}`} />
          <span className="hidden sm:inline">PS5 Ambience</span>
          <span className={isAmbientPlaying ? 'text-sky-400 font-bold' : 'text-slate-500'}>
            {isAmbientPlaying ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={handleMuteToggle}
          className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-900/80 border border-slate-800 transition-colors"
          title="Toggle Sound Effects"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* PS5 Clock */}
        <div className="font-semibold text-slate-200 tabular-nums text-xs min-w-[65px] text-right">
          {timeString || '8:12 AM'}
        </div>

        {/* User Profile Pill with Avatar & Level */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-1 ring-white/20">
              ZN
            </div>
            {/* PlayStation Plus badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black">
              +
            </div>
          </div>
          <div className="hidden md:block text-left text-[11px]">
            <div className="font-semibold text-white leading-tight">Zayn N.</div>
            <div className="text-[10px] text-amber-400 font-mono">Level 34 ★</div>
          </div>
        </div>
      </div>
    </header>
  );
};
