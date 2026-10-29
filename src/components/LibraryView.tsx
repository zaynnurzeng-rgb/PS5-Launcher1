import React, { useState } from 'react';
import { GameItem, EmulatorPlatform } from '../types/savesync';
import { formatBytes } from '../utils/hexHelper';
import {
  Search,
  RefreshCw,
  FolderOpen,
  Binary,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Gamepad2,
  UploadCloud,
  FileCode,
  PlusCircle,
  EyeOff,
  Eye,
  Github,
} from 'lucide-react';
import { EMULATOR_THEMES } from '../utils/emulatorThemes';

interface LibraryViewProps {
  games: GameItem[];
  onOpenSlots: (game: GameItem) => void;
  onOpenHex: (game: GameItem) => void;
  onSyncGame: (gameId: string) => void;
  onLaunchGame: (game: GameItem) => void;
  onOpenPathsModal: () => void;
  onImportCustomSave: (file: File) => void;
  isSyncingId: string | null;
  onOpenStealthVault: () => void;
  onToggleHideGame: (gameId: string) => void;
  onOpenGitHubArt?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  games,
  onOpenSlots,
  onOpenHex,
  onSyncGame,
  onLaunchGame,
  onOpenPathsModal,
  onImportCustomSave,
  isSyncingId,
  onOpenStealthVault,
  onToggleHideGame,
  onOpenGitHubArt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  // Platform filters
  const platforms = [
    { id: 'all', label: 'All Platforms' },
    { id: 'ppsspp', label: 'PPSSPP (PSP)' },
    { id: 'aethersx2', label: 'AetherSX2 (PS2)' },
    { id: 'citra', label: 'Citra (3DS)' },
    { id: 'dolphin', label: 'Dolphin (GC)' },
    { id: 'skyline', label: 'Skyline (Switch)' },
    { id: 'builtin_runner', label: 'In-App Sandbox' },
  ];

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.platformName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.packageOrRomId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || game.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Calculate totals
  const totalSlots = games.reduce((acc, g) => acc + g.slots.length, 0);
  const totalBytes = games.reduce(
    (acc, g) => acc + g.slots.reduce((slotAcc, s) => slotAcc + s.sizeBytes, 0),
    0
  );
  const syncedCount = games.filter((g) => g.cloudSyncStatus === 'synced').length;

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportCustomSave(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip - Clean, unboxed text & tabular figures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="text-xs text-slate-400 font-medium">MANAGED TITLES</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-0.5">{games.length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">TOTAL SAVE SLOTS</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-0.5">{totalSlots}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">SAVE STORAGE USED</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-0.5">
            {formatBytes(totalBytes)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">CLOUD SYNC HEALTH</div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-0.5">
            {Math.round((syncedCount / games.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Platform Segmented Tabs, and Storage Paths action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, ROM ID, or emulator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span>Import Save File</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onImportCustomSave(e.target.files[0]);
                }
              }}
            />
          </label>

          <button
            onClick={onOpenPathsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Storage Paths</span>
          </button>

          <button
            onClick={onOpenStealthVault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            title="Conceal emulator & game apps from the Android home screen"
          >
            <EyeOff className="w-4 h-4 text-sky-400" />
            <span>Home Concealment ({games.filter((g) => g.isHiddenFromAndroidHome).length})</span>
          </button>

          {onOpenGitHubArt && (
            <button
              onClick={onOpenGitHubArt}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              title="GitHub Emulator Art & Background Auto-Sync"
            >
              <Github className="w-4 h-4 text-sky-400" />
              <span>GitHub Art</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Platform Tabs with Emulator Identity Backdrop */}
      <div className="relative rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 overflow-hidden shadow-lg">
        {/* Themed Background image matching the selected emulator identity */}
        {selectedPlatform !== 'all' && EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES] && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none transition-all duration-500 filter blur-xs"
            style={{
              backgroundImage: `url(${EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES].wallpaperSvg})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/90 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              EMULATOR PLATFORM SELECTION
            </span>
            {selectedPlatform !== 'all' && EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES] && (
              <span className="text-sky-400 text-[10px] hidden sm:inline">
                {EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES].hardwareGeneration}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap relative ${
                  selectedPlatform === p.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {selectedPlatform !== 'all' && EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES] && (
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900/80 flex items-center justify-between">
              <span>{EMULATOR_THEMES[selectedPlatform as keyof typeof EMULATOR_THEMES].description}</span>
              <span className="font-mono text-slate-500 text-[10px]">
                {filteredGames.length} title(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop Import Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
          isDragOver
            ? 'border-sky-400 bg-sky-950/20 text-sky-300'
            : 'border-slate-800/80 bg-slate-900/30 text-slate-400'
        }`}
      >
        <p className="text-xs">
          Drop any emulator save file here (<span className="font-mono text-slate-300">.sav</span>,{' '}
          <span className="font-mono text-slate-300">.srm</span>,{' '}
          <span className="font-mono text-slate-300">.mcd</span>,{' '}
          <span className="font-mono text-slate-300">.state</span>) to inspect hex, parse metadata, and cloud sync.
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const gameStorageBytes = game.slots.reduce((acc, s) => acc + s.sizeBytes, 0);
          const isCurrentlySyncing = isSyncingId === game.id;

          return (
            <div
              key={game.id}
              className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col"
            >
              {/* Artwork Box */}
              <div className="relative aspect-[16/9] w-full bg-slate-800 overflow-hidden shrink-0">
                {game.boxArt ? (
                  <img
                    src={game.boxArt}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  // Resilient styled fallback container
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 p-4">
                    <Gamepad2 className="w-10 h-10 mb-2 opacity-40" />
                    <span className="text-xs font-semibold text-center">{game.title}</span>
                  </div>
                )}

                {/* Subtle scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Platform Badge (unboxed text badge on corner) */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono text-sky-400 border border-slate-800">
                  {game.platformName}
                </div>

                {/* Sync status tag */}
                <div className="absolute top-3 right-3">
                  {game.cloudSyncStatus === 'synced' && (
                    <div className="flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Synced</span>
                    </div>
                  )}
                  {game.cloudSyncStatus === 'pending' && (
                    <div className="flex items-center gap-1 bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>Unsynced Changes</span>
                    </div>
                  )}
                  {game.cloudSyncStatus === 'conflict' && (
                    <div className="flex items-center gap-1 bg-rose-950/80 text-rose-400 border border-rose-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Conflict</span>
                    </div>
                  )}

                  {/* Android Home Concealment badge */}
                  {game.isHiddenFromAndroidHome && (
                    <div className="flex items-center gap-1 bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded text-[10px] font-mono mt-1">
                      <EyeOff className="w-2.5 h-2.5" />
                      <span>Concealed</span>
                    </div>
                  )}
                </div>

                {/* Bottom title in scrim */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="text-xs text-slate-300 font-mono mt-0.5 truncate">
                    {game.packageOrRomId}
                  </div>
                </div>
              </div>

              {/* Card Body & Unboxed Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Clean unboxed metadata with dot separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="tabular-nums">{game.slots.length} save slots</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatBytes(gameStorageBytes)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{game.totalPlaytime}</span>
                  </div>

                  {/* Save directory path */}
                  <div className="text-[11px] text-slate-500 font-mono truncate bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400">Path: </span>
                    {game.storagePath}
                  </div>

                  {/* Latest slot snapshot preview */}
                  {game.slots[0] && (
                    <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                        <span className="truncate">{game.slots[0].name}</span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                          {game.slots[0].slotNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>CRC: {game.slots[0].checksum}</span>
                        <span>{new Date(game.slots[0].timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenSlots(game)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                      title="Manage save slots and rollback history"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>Slots</span>
                    </button>

                    <button
                      onClick={() => onOpenHex(game)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                      title="Inspect raw binary hex & values"
                    >
                      <Binary className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hex</span>
                    </button>

                    {game.isBuiltIn && (
                      <button
                        onClick={() => onLaunchGame(game)}
                        className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleHideGame(game.id)}
                      className={`p-1.5 rounded transition-colors ${
                        game.isHiddenFromAndroidHome
                          ? 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-800/80'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                      title={
                        game.isHiddenFromAndroidHome
                          ? 'Concealed from Android Home Screen (Click to restore)'
                          : 'Visible on Android Home Screen (Click to conceal)'
                      }
                    >
                      {game.isHiddenFromAndroidHome ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onSyncGame(game.id)}
                      disabled={isCurrentlySyncing}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded transition-colors"
                      title="Sync this game to cloud now"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isCurrentlySyncing ? 'animate-spin text-sky-400' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
