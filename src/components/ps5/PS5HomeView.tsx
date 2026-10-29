import React, { useState, useEffect, useRef } from 'react';
import { GameItem, SaveSlot, SyncDevice, CloudConfig } from '../../types/savesync';
import { formatBytes, formatRelativeTime } from '../../utils/hexHelper';
import { sound } from '../../utils/audio';
import {
  Play,
  RefreshCw,
  Layers,
  Binary,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  UploadCloud,
  Smartphone,
  ChevronRight,
  EyeOff,
  Eye,
  Github,
  Palette,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import {
  resolveBackdrop,
  BackdropMode,
  EMULATOR_THEMES,
} from '../../utils/emulatorThemes';

interface PS5HomeViewProps {
  games: GameItem[];
  selectedGame: GameItem;
  onSelectGame: (game: GameItem) => void;
  onLaunchGame: (game: GameItem) => void;
  onOpenSlots: (game: GameItem) => void;
  onOpenHex: (game: GameItem) => void;
  onSyncGame: (gameId: string) => void;
  onOpenPathsModal: () => void;
  onImportCustomSave: (file: File) => void;
  isSyncingId: string | null;
  cloudConfig: CloudConfig;
  devices: SyncDevice[];
  onOpenCloudTab: () => void;
  onOpenDevicesTab: () => void;
  onSimulateConflict: () => void;
  onOpenStealthVault: () => void;
  onToggleHideGame: (gameId: string) => void;
  onOpenGitHubArt: () => void;
  backdropMode: BackdropMode;
  onChangeBackdropMode: (mode: BackdropMode) => void;
  lastPlayedGame?: GameItem;
}

export const PS5HomeView: React.FC<PS5HomeViewProps> = ({
  games,
  selectedGame,
  onSelectGame,
  onLaunchGame,
  onOpenSlots,
  onOpenHex,
  onSyncGame,
  onOpenPathsModal,
  onImportCustomSave,
  isSyncingId,
  cloudConfig,
  devices,
  onOpenCloudTab,
  onOpenDevicesTab,
  onSimulateConflict,
  onOpenStealthVault,
  onToggleHideGame,
  onOpenGitHubArt,
  backdropMode,
  onChangeBackdropMode,
  lastPlayedGame,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Focus navigation sound
  const handleGameFocus = (game: GameItem) => {
    if (game.id !== selectedGame.id) {
      sound.playPS5Focus();
      onSelectGame(game);
    }
  };

  // Keyboard navigation for PS5 Home Carousel (ArrowLeft, ArrowRight, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentIndex = games.findIndex((g) => g.id === selectedGame.id);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = (currentIndex + 1) % games.length;
        handleGameFocus(games[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx = (currentIndex - 1 + games.length) % games.length;
        handleGameFocus(games[prevIdx]);
      } else if (e.key === 'Enter' || e.code === 'KeyX') {
        e.preventDefault();
        sound.playPS5Confirm();
        if (selectedGame.isBuiltIn) {
          onLaunchGame(selectedGame);
        } else {
          onOpenSlots(selectedGame);
        }
      } else if (e.code === 'KeyT') {
        // Triangle: Sync
        e.preventDefault();
        sound.playPS5Confirm();
        onSyncGame(selectedGame.id);
      } else if (e.code === 'KeyH') {
        // Square: Hex Editor
        e.preventDefault();
        sound.playPS5Confirm();
        onOpenHex(selectedGame);
      } else if (e.code === 'KeyO') {
        // Options: Slot Manager
        e.preventDefault();
        sound.playPS5Confirm();
        onOpenSlots(selectedGame);
      } else if (e.code === 'KeyP') {
        // PS Button
        e.preventDefault();
        sound.playPS5ControlCenter();
        setControlCenterOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [games, selectedGame, onLaunchGame, onOpenSlots, onOpenHex, onSyncGame]);

  const topSlot = selectedGame.slots[0];
  const isCurrentlySyncing = isSyncingId === selectedGame.id;
  const currentBackdrop = resolveBackdrop(selectedGame, backdropMode, games);
  const palette = currentBackdrop.palette;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Dynamic Adaptive Background System */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Full-Screen Ultra-High-Resolution Blurred Wallpaper or Hero Art */}
        <img
          key={currentBackdrop.imageUrl}
          src={currentBackdrop.imageUrl}
          alt={currentBackdrop.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-md brightness-[0.32] scale-105 transition-all duration-700 ease-out"
        />

        {/* Dynamic Extracted Radial Atmosphere Bloom matching key palette */}
        <div
          className="absolute inset-0 transition-all duration-700 ease-out pointer-events-none"
          style={{
            background: palette.radialAtmosphere,
          }}
        />

        {/* Primary Color Atmospheric Glow */}
        <div
          className="absolute -top-32 right-0 w-[850px] h-[850px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ease-out"
          style={{
            backgroundColor: palette.primary,
            opacity: 0.18,
          }}
        />

        {/* Secondary Accent Color Atmospheric Bloom */}
        <div
          className="absolute bottom-10 left-1/4 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out"
          style={{
            backgroundColor: palette.secondary,
            opacity: 0.12,
          }}
        />

        {/* Smooth Dark Charcoal Base Gradient Scrim matching extracted tone */}
        <div
          className="absolute inset-0 transition-colors duration-700 ease-out pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${palette.darkCharcoal}bf 0%, rgba(2, 6, 23, 0.72) 40%, rgba(2, 6, 23, 0.95) 100%)`,
          }}
        />

        {/* Horizontal Dark Scrim for high-contrast text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Carousel of Game Tiles (PS5 Home Row - EMULATOR SELECTION & MANAGED TITLES) */}
      <div className="relative pt-2 pb-6">
        {/* Dedicated Background Layer directly behind Emulator Selection */}
        <div
          className={`absolute inset-x-0 -inset-y-2 -z-1 rounded-2xl overflow-hidden border ${palette.accentBorder} bg-slate-950/70 backdrop-blur-md transition-all duration-500`}
          style={{
            boxShadow: `0 10px 36px ${palette.accentGlow}`,
          }}
        >
          {/* Subtle reflection image */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center transition-all duration-700 pointer-events-none filter blur-xs"
            style={{ backgroundImage: `url(${currentBackdrop.imageUrl})` }}
          />
          {/* Palette ambient glow within carousel backdrop */}
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{ background: palette.radialAtmosphere, opacity: 0.35 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-transparent to-slate-950/95 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none" />
        </div>

        {/* Header Bar above Emulator Carousel */}
        <div className="relative z-10 px-3 text-[11px] font-mono tracking-widest text-slate-400 mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: palette.primary }}
            />
            <span className="text-white font-bold">EMULATOR SELECTION</span>
            <span className="text-slate-600">·</span>
            <span>{games.length} MANAGED TITLES</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 hidden sm:inline">
              {currentBackdrop.themeMode === 'emulator' ? 'EMULATOR THEME: ' : 'ACTIVE TITLE: '}
              <span className="text-white font-semibold">{currentBackdrop.title}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Extracted Color Palette Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300">
              <span
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: palette.primary }}
              />
              <span className="text-slate-400">PALETTE:</span>
              <span className="text-white font-medium">{palette.brandName}</span>
            </div>

            {/* Mode Switcher for Adaptive Background System */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
              <button
                onClick={() => {
                  sound.playPS5Click();
                  onChangeBackdropMode('game');
                }}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  backdropMode === 'game'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Game Selection Mode: Ultra-high-resolution blurred wallpaper matching active game's extracted palette (e.g. fiery crimson & dark charcoal for Chained Fury)"
              >
                Game Mode
              </button>
              <button
                onClick={() => {
                  sound.playPS5Click();
                  onChangeBackdropMode('emulator');
                }}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  backdropMode === 'emulator'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Emulator Theme Mode: Subtly shifts to match the platform's brand identity (PSP blue, 3DS red/cyan, PS2 Emotion blue, Dolphin indigo)"
              >
                Emulator Theme
              </button>
              <button
                onClick={() => {
                  sound.playPS5Click();
                  onChangeBackdropMode('auto');
                }}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  backdropMode === 'auto'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dynamic Auto Blend"
              >
                Auto
              </button>
            </div>

            {/* GitHub Art Sync Button */}
            <button
              onClick={() => {
                sound.playPS5Click();
                onOpenGitHubArt();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono text-sky-400 border border-slate-800 hover:border-sky-500/50 transition-all shadow-sm"
              title="GitHub Emulator Art & Background Auto-Sync"
            >
              <Github className="w-3 h-3 text-sky-400" />
              <span className="hidden md:inline">GitHub Art</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Carousel */}
        <div
          ref={carouselRef}
          className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none focus:outline-none"
        >
          {games.map((game) => {
            const isSelected = game.id === selectedGame.id;
            return (
              <button
                key={game.id}
                onClick={() => handleGameFocus(game)}
                className={`relative shrink-0 rounded-xl transition-all duration-300 ease-out flex flex-col items-center group ${
                  isSelected
                    ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-slate-950 shadow-2xl z-20'
                    : 'opacity-65 hover:opacity-100 scale-95 hover:scale-100 ring-1 ring-slate-800'
                }`}
                style={
                  isSelected
                    ? {
                        boxShadow: `0 12px 36px ${palette.accentGlow}`,
                      }
                    : undefined
                }
              >
                {/* Tile Cover */}
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden bg-slate-800 relative">
                  {game.boxArt ? (
                    <img
                      src={game.boxArt}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-800">
                      <Layers className="w-8 h-8 text-sky-400/60 mb-1" />
                      <span className="text-[10px] font-bold text-slate-300 line-clamp-2">
                        {game.title}
                      </span>
                    </div>
                  )}

                  {/* Platform corner label */}
                  <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-sky-300 border border-slate-700/60">
                    {game.platform.toUpperCase()}
                  </div>

                  {/* Sync status indicator */}
                  <div className="absolute top-2 right-2">
                    {game.cloudSyncStatus === 'synced' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-sm" />
                    )}
                    {game.cloudSyncStatus === 'pending' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950 shadow-sm animate-pulse" />
                    )}
                    {game.cloudSyncStatus === 'conflict' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-slate-950 shadow-sm animate-ping" />
                    )}
                  </div>

                  {/* Android Home Concealment badge */}
                  {game.isHiddenFromAndroidHome && (
                    <div
                      className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-xs px-1 py-0.5 rounded text-sky-400 border border-slate-700/60"
                      title="Hidden from Android Home Screen"
                    >
                      <EyeOff className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Sub-label under active tile */}
                {isSelected && (
                  <div className="absolute -bottom-6 text-[11px] font-semibold text-white whitespace-nowrap drop-shadow-md">
                    {game.title}
                  </div>
                )}
              </button>
            );
          })}

          {/* "+ Add / Import Save" Tile */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-sky-400 text-slate-400 hover:text-white transition-all flex flex-col items-center justify-center p-3 group"
          >
            <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-sky-400 mb-2 transition-colors" />
            <span className="text-xs font-semibold text-center">Import Save</span>
            <span className="text-[10px] font-mono text-slate-500 mt-0.5">.sav / .srm</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onImportCustomSave(e.target.files[0]);
                }
              }}
            />
          </button>
        </div>
      </div>

      {/* 3. PS5 Game Hub & Primary Action Area */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl py-4 space-y-5">
        <div>
          {/* Platform & Metadata Unboxed Header */}
          <div className="flex items-center gap-3 text-xs font-mono font-semibold mb-2">
            <span className={palette.accentText}>{selectedGame.platformName}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{selectedGame.packageOrRomId}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{selectedGame.saveFormat}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Theme: {palette.brandName}</span>
          </div>

          {/* Big Cinematic Game Title */}
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {selectedGame.title}
          </h1>

          <p className="text-sm md:text-base text-slate-300 mt-2.5 max-w-2xl leading-relaxed drop-shadow">
            {selectedGame.description}
          </p>

          {/* Clean Glassmorphism Cards for Game Details: Playtime, Saved States, Cloud Sync status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-4">
            {/* 1. Playtime Glass Card */}
            <div
              className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20"
              style={{
                borderTopColor: palette.primary,
                borderTopWidth: '2px',
              }}
            >
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                TOTAL PLAYTIME
              </div>
              <div className="text-xl font-bold text-white tracking-tight mt-0.5 tabular-nums">
                {selectedGame.totalPlaytime}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Last: {selectedGame.lastPlayed}
              </div>
            </div>

            {/* 2. Saved States Glass Card */}
            <div
              className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20"
              style={{
                borderTopColor: palette.secondary,
                borderTopWidth: '2px',
              }}
            >
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                SAVED STATES
              </div>
              <div className="text-xl font-bold text-white tracking-tight mt-0.5 tabular-nums">
                {selectedGame.slots.length} Active Slots
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                Active: {topSlot?.slotNumber || 'Slot 1'}
              </div>
            </div>

            {/* 3. Cloud Sync Status Glass Card */}
            <div
              className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20"
              style={{
                borderTopColor:
                  selectedGame.cloudSyncStatus === 'synced'
                    ? '#10b981'
                    : selectedGame.cloudSyncStatus === 'conflict'
                    ? '#f43f5e'
                    : '#f59e0b',
                borderTopWidth: '2px',
              }}
            >
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>CLOUD SYNC STATUS</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedGame.cloudSyncStatus === 'synced'
                      ? 'bg-emerald-400'
                      : selectedGame.cloudSyncStatus === 'conflict'
                      ? 'bg-rose-400 animate-ping'
                      : 'bg-amber-400 animate-pulse'
                  }`}
                />
              </div>
              <div
                className={`text-xl font-bold tracking-tight mt-0.5 tabular-nums uppercase ${
                  selectedGame.cloudSyncStatus === 'synced'
                    ? 'text-emerald-400'
                    : selectedGame.cloudSyncStatus === 'conflict'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {selectedGame.cloudSyncStatus}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                Google Drive v3 · Scoped
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Action Buttons: 'Manage & Launch', 'Sync Cloud Save', 'Hex Memory Editor' */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* 1. Main Action: Manage & Launch (or Resume Mission) with DualSense Cross ✕ prompt */}
          <button
            onClick={() => {
              sound.playPS5Confirm();
              if (selectedGame.isBuiltIn) {
                onLaunchGame(selectedGame);
              } else {
                onOpenSlots(selectedGame);
              }
            }}
            className="flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-sm rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: `0 0 28px ${palette.accentGlow}`,
            }}
          >
            <span className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center font-mono text-xs font-black">
              ✕
            </span>
            <span>{selectedGame.isBuiltIn ? 'Resume Mission' : 'Manage & Launch'}</span>
          </button>

          {/* 2. Sync Cloud Save with DualSense Triangle △ prompt */}
          <button
            onClick={() => {
              sound.playPS5Confirm();
              onSyncGame(selectedGame.id);
            }}
            disabled={isCurrentlySyncing}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition-all hover:border-white/30"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono text-xs font-black">
              △
            </span>
            <RefreshCw
              className={`w-3.5 h-3.5 ${isCurrentlySyncing ? 'animate-spin text-sky-400' : 'text-emerald-400'}`}
            />
            <span>{isCurrentlySyncing ? 'Syncing Cloud...' : 'Sync Cloud Save'}</span>
          </button>

          {/* 3. Hex Memory Editor with DualSense Circle ○ prompt */}
          <button
            onClick={() => {
              sound.playPS5Confirm();
              onOpenHex(selectedGame);
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition-all hover:border-white/30"
          >
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-black">
              ○
            </span>
            <Binary className="w-3.5 h-3.5 text-amber-400" />
            <span>Hex Memory Editor</span>
          </button>

          {/* 4. Save Slots with DualSense Square □ prompt */}
          <button
            onClick={() => {
              sound.playPS5Confirm();
              onOpenSlots(selectedGame);
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition-all hover:border-white/30"
          >
            <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center font-mono text-xs font-black">
              □
            </span>
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Save Slots ({selectedGame.slots.length})</span>
          </button>

          {/* 5. Android Home Concealment Button */}
          <button
            onClick={() => {
              sound.playPS5Click();
              onToggleHideGame(selectedGame.id);
            }}
            className={`flex items-center gap-2.5 px-4 py-3.5 rounded-full text-xs font-semibold border backdrop-blur-xl transition-all ${
              selectedGame.isHiddenFromAndroidHome
                ? 'bg-sky-950/80 text-sky-300 border-sky-500/50 hover:bg-sky-900/60 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Conceal or restore this app on the Android Home Screen"
          >
            {selectedGame.isHiddenFromAndroidHome ? (
              <EyeOff className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>
              {selectedGame.isHiddenFromAndroidHome
                ? 'Hidden from Android Home'
                : 'Visible on System Home'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. PS5 Contextual Activity Cards Strip (Control Center Cards) */}
      <div className="pt-3 pb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="tracking-wider">CURRENT SAVE ACTIVITIES & ISOLATION STATE</span>
          <button
            onClick={() => onOpenSlots(selectedGame)}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>View All Snapshots</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Activity Card 1: Resume State */}
          <div
            onClick={() => {
              sound.playPS5Confirm();
              if (selectedGame.isBuiltIn) onLaunchGame(selectedGame);
              else onOpenSlots(selectedGame);
            }}
            className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/20 rounded-2xl backdrop-blur-xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className={palette.accentText}>RESUME ACTIVITY</span>
                <span>{topSlot ? topSlot.slotNumber : 'Slot 1'}</span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                {topSlot ? topSlot.name : 'Latest Checkpoint'}
              </h4>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Progress: {topSlot?.inGameLevel || 'Sector 1'} · {topSlot?.playtime || '0h 00m'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>CRC: {topSlot?.checksum || 'N/A'}</span>
              <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform">
                Quick Load →
              </span>
            </div>
          </div>

          {/* Activity Card 2: Cloud Sync Vault */}
          <div
            onClick={() => {
              sound.playPS5Confirm();
              onOpenCloudTab();
            }}
            className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 rounded-2xl backdrop-blur-xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="text-emerald-400 font-semibold">CLOUD VAULT</span>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {selectedGame.cloudSyncStatus === 'synced'
                  ? 'Cloud Save In-Sync'
                  : 'Pending Synchronization'}
              </h4>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Google Drive API v3 · Auto-Watcher Active
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{formatRelativeTime(cloudConfig.lastGlobalSync)}</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                Cloud Settings →
              </span>
            </div>
          </div>

          {/* Activity Card 3: Storage & Scoped Path */}
          <div
            onClick={() => {
              sound.playPS5Confirm();
              onOpenPathsModal();
            }}
            className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-amber-500/40 rounded-2xl backdrop-blur-xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="text-amber-400 font-semibold">SCOPED STORAGE</span>
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Directory & Access Rights
              </h4>
              <div className="text-xs text-slate-400 font-mono mt-1 truncate">
                {selectedGame.storagePath}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Android SAF / Shizuku</span>
              <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">
                View Path →
              </span>
            </div>
          </div>

          {/* Activity Card 4: Android Home Screen Concealment */}
          <div
            onClick={() => {
              sound.playPS5Confirm();
              onOpenStealthVault();
            }}
            className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-purple-500/40 rounded-2xl backdrop-blur-xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="text-purple-400 font-semibold">HOME CONCEALMENT</span>
                <EyeOff className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {selectedGame.isHiddenFromAndroidHome
                  ? 'Hidden from Android Home'
                  : 'Visible on System Home'}
              </h4>
              <div className="text-xs text-slate-400 font-mono mt-1 truncate">
                Package: {selectedGame.packageName || 'Auto-Protected'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="text-purple-300 font-semibold">
                {selectedGame.isHiddenFromAndroidHome ? 'Concealed (Active)' : 'Unprotected'}
              </span>
              <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">
                Vault Config →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PS5 DualSense Controller Hint Footer */}
      <div className="pt-3 pb-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-white text-slate-950 font-black text-[10px] flex items-center justify-center">
              ✕
            </span>
            <span>Select / Play</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black text-[10px] flex items-center justify-center">
              △
            </span>
            <span>Cloud Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-400 border border-pink-500/50 font-black text-[10px] flex items-center justify-center">
              □
            </span>
            <span>Slots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-400 border border-amber-500/50 font-black text-[10px] flex items-center justify-center">
              ○
            </span>
            <span>Hex Inspector</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Ambient Backsound Toggle */}
          <button
            onClick={() => {
              sound.playPS5Click();
              sound.toggleAmbientMusic();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-full text-xs font-mono transition-colors"
            title="Toggle PS5 Home ambient background audio"
          >
            <span>🎵 PS5 Backsound</span>
          </button>

          {/* PS Button Control Center Trigger */}
          <button
            onClick={() => {
              sound.playPS5ControlCenter();
              setControlCenterOpen(!controlCenterOpen);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-full text-xs font-medium transition-colors"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-sky-400/50 shadow-sm flex items-center justify-center">
              <img
                src="/assets/aistudio/1793288020920_0f8a499b.jpg"
                alt="PS5"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span>Control Center</span>
          </button>
        </div>
      </div>

      {/* 6. PS5 Control Center (Quick Menu Drawer / Overlay) */}
      {controlCenterOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-950/95 border-t border-slate-800 p-6 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-sm font-bold text-white font-mono">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-sky-400/60 shadow-sm">
                  <img
                    src="/assets/aistudio/1793288020920_0f8a499b.jpg"
                    alt="PS5 Logo"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <span>PLAYSTATION 5 CONTROL CENTER · SAVESYNC</span>
              </div>
              <button
                onClick={() => setControlCenterOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Close (Esc)
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  onOpenGitHubArt();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-colors"
              >
                <Github className="w-5 h-5 text-sky-400 mb-2" />
                <div className="font-bold text-xs text-white">GitHub Art Sync</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Backdrops & Themes
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenCloudTab();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-colors"
              >
                <Cloud className="w-5 h-5 text-sky-400 mb-2" />
                <div className="font-bold text-xs text-white">Cloud Storage</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {formatBytes(cloudConfig.usedStorageBytes)} / 15 GB
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenDevicesTab();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-colors"
              >
                <Smartphone className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="font-bold text-xs text-white">Paired Consoles</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {devices.length} Handhelds
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenPathsModal();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-amber-400 mb-2" />
                <div className="font-bold text-xs text-white">Emulator Paths</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Scoped Storage Map
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenStealthVault();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-colors"
              >
                <EyeOff className="w-5 h-5 text-purple-400 mb-2" />
                <div className="font-bold text-xs text-white">Home Concealment</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Stealth Space Config
                </div>
              </button>

              <button
                onClick={() => {
                  onSimulateConflict();
                  setControlCenterOpen(false);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-rose-400 mb-2" />
                <div className="font-bold text-xs text-white">Simulate Conflict</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Handheld Conflict Flow
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
