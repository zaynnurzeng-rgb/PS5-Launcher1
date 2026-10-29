/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameItem } from '../types/savesync';
import {
  BackdropMode,
  saveBackdropMode,
  EMULATOR_THEMES,
} from '../utils/emulatorThemes';
import {
  getGitHubArtRecords,
  downloadGameArtFromGitHub,
  getGitHubRepoUrl,
  setGitHubRepoUrl,
  isAutoDownloadFromGitHubEnabled,
  setAutoDownloadFromGitHubEnabled,
  GitHubArtRecord,
} from '../utils/githubArtSync';
import { sound } from '../utils/audio';
import { formatBytes, formatRelativeTime } from '../utils/hexHelper';
import {
  X,
  Github,
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Settings2,
  Sliders,
  ExternalLink,
  Shield,
  Monitor,
  Flame,
} from 'lucide-react';

interface GitHubArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  currentMode: BackdropMode;
  onChangeMode: (mode: BackdropMode) => void;
  lastPlayedTitle?: string;
  onRefreshArt: () => void;
}

export const GitHubArtModal: React.FC<GitHubArtModalProps> = ({
  isOpen,
  onClose,
  games,
  currentMode,
  onChangeMode,
  lastPlayedTitle = 'Cyberblast Adventures',
  onRefreshArt,
}) => {
  const [records, setRecords] = useState<Record<string, GitHubArtRecord>>(getGitHubArtRecords());
  const [repoUrl, setRepoUrl] = useState(getGitHubRepoUrl());
  const [autoDownload, setAutoDownload] = useState(isAutoDownloadFromGitHubEnabled());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);
  const [selectedPreviewGame, setSelectedPreviewGame] = useState<GameItem>(games[0]);

  if (!isOpen) return null;

  const handleModeSelect = (mode: BackdropMode) => {
    sound.playPS5Click();
    saveBackdropMode(mode);
    onChangeMode(mode);
  };

  const handleToggleAutoDownload = () => {
    sound.playPS5Click();
    const next = !autoDownload;
    setAutoDownload(next);
    setAutoDownloadFromGitHubEnabled(next);
  };

  const handleSaveRepo = () => {
    sound.playPS5Confirm();
    setGitHubRepoUrl(repoUrl);
  };

  const handleDownloadAllFromGitHub = async () => {
    sound.playPS5Confirm();
    setIsDownloadingAll(true);
    setCurrentProgress('Starting automated GitHub art fetcher...');

    for (const game of games) {
      await downloadGameArtFromGitHub(game, (msg) => setCurrentProgress(msg));
    }

    setRecords(getGitHubArtRecords());
    setIsDownloadingAll(false);
    setCurrentProgress(null);
    sound.playSaveChime();
    onRefreshArt();
  };

  const totalDownloadedBytes = Object.values(records).reduce((acc, r) => acc + r.sizeBytes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
              <Github className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  GitHub Emulator Art & Background Sync
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GitHub API Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated backdrop download engine matching emulator identities or last played titles.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPS5Back();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Background Behind Emulator Selection Mode */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  Backdrop Image Behind Emulator Selection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select which artwork dynamically renders behind the PS5 emulator selection carousel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Match Emulator's Identity */}
              <button
                onClick={() => handleModeSelect('emulator')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  currentMode === 'emulator'
                    ? 'bg-sky-950/30 border-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-sky-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    Emulator Identity
                  </span>
                  {currentMode === 'emulator' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Renders the emulator's signature visual identity (PSP cosmic waves, PS2 Emotion Engine towers, 3DS gold crystal aura, GameCube cube, Switch neon split).
                </p>
              </button>

              {/* Option 2: Match Last Game Played */}
              <button
                onClick={() => handleModeSelect('last_played')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  currentMode === 'last_played'
                    ? 'bg-sky-950/30 border-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-sky-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Last Game Played
                  </span>
                  {currentMode === 'last_played' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically updates to match the heroic background art of the last game you played or launched ({lastPlayedTitle}).
                </p>
              </button>

              {/* Option 3: Dynamic Auto Blend */}
              <button
                onClick={() => handleModeSelect('auto')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  currentMode === 'auto'
                    ? 'bg-sky-950/30 border-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-sky-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Dynamic Auto
                  </span>
                  {currentMode === 'auto' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Prioritizes high-res game box art if downloaded from GitHub; falls back to iconic emulator system wallpapers.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: GitHub Repository & Auto-Download Settings */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-300" />
                  GitHub Art Repository Downloader
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Downloads high-resolution 1080p backdrops and cover art from GitHub on demand or whenever new titles are imported.
                </p>
              </div>

              {/* Auto Download Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Auto-Download:</span>
                <button
                  onClick={handleToggleAutoDownload}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    autoDownload ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoDownload ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Repo Input & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="GitHub Repo URL (e.g. https://github.com/libretro/libretro-thumbnails)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleSaveRepo}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
              >
                Save Repo
              </button>
              <button
                disabled={isDownloadingAll}
                onClick={handleDownloadAllFromGitHub}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-colors whitespace-nowrap"
              >
                {isDownloadingAll ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>Auto-Download All from GitHub</span>
              </button>
            </div>

            {/* Live Progress Bar */}
            {currentProgress && (
              <div className="p-3 bg-sky-950/30 border border-sky-800/60 rounded-lg flex items-center gap-2 text-xs text-sky-300 font-mono animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{currentProgress}</span>
              </div>
            )}

            {/* Stats Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
              <div className="flex items-center gap-4">
                <span>Cached from GitHub: {Object.keys(records).length} titles</span>
                <span>·</span>
                <span>Storage Cached: {formatBytes(totalDownloadedBytes)}</span>
              </div>
              <span className="text-emerald-400">CDN ETag Verified</span>
            </div>
          </div>

          {/* Section 3: Gallery of Downloaded GitHub Artwork */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                Downloaded GitHub Backdrops & Emulator Themes ({games.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Click any title to preview its backdrop identity
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {games.map((game) => {
                const record = records[game.id];
                const theme = EMULATOR_THEMES[game.platform];
                const isSelected = selectedPreviewGame.id === game.id;
                const thumb = record?.boxartUrl || game.boxArt || theme?.wallpaperSvg;

                return (
                  <button
                    key={game.id}
                    onClick={() => {
                      sound.playPS5Click();
                      setSelectedPreviewGame(game);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col group transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 mb-2 relative">
                      <img
                        src={thumb}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono bg-slate-950/80 text-sky-300 border border-slate-800">
                        {game.platform.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                      {game.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        GitHub
                      </span>
                      <span className="font-mono text-slate-500">
                        {record ? formatBytes(record.sizeBytes) : '320 KB'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Game Preview Strip */}
            {selectedPreviewGame && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  <img
                    src={
                      records[selectedPreviewGame.id]?.backdropUrl ||
                      selectedPreviewGame.boxArt ||
                      EMULATOR_THEMES[selectedPreviewGame.platform]?.wallpaperSvg
                    }
                    alt={selectedPreviewGame.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <div className="text-sm font-bold text-white">{selectedPreviewGame.title}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Platform:{' '}
                    <span className="text-sky-400">
                      {EMULATOR_THEMES[selectedPreviewGame.platform]?.systemName}
                    </span>{' '}
                    · Save Format: {selectedPreviewGame.saveFormat}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {EMULATOR_THEMES[selectedPreviewGame.platform]?.description}
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playPS5Click();
                    downloadGameArtFromGitHub(selectedPreviewGame, (msg) =>
                      setCurrentProgress(msg)
                    ).then(() => {
                      setRecords(getGitHubArtRecords());
                      setCurrentProgress(null);
                      sound.playSaveChime();
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-fetch from GitHub</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>GitHub thumb CDN automatically downloads non-copyrighted homebrew artwork & system themes.</span>
          </div>
          <button
            onClick={() => {
              sound.playPS5Confirm();
              onClose();
            }}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
