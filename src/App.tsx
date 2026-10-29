/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameItem,
  SaveSlot,
  SyncDevice,
  CloudConfig,
  SyncLogEntry,
  SaveHistoryEntry,
} from './types/savesync';
import {
  INITIAL_GAMES,
  INITIAL_DEVICES,
  INITIAL_CLOUD_CONFIG,
  INITIAL_SYNC_LOGS,
  INITIAL_CONCEALMENT_SETTINGS,
} from './utils/initialData';
import { calculateCRC32, stringToHex, hexToString, formatBytes } from './utils/hexHelper';
import { sound } from './utils/audio';

import { TopNav } from './components/TopNav';
import { LibraryView } from './components/LibraryView';
import { SlotManagerModal } from './components/SlotManagerModal';
import { SaveEditorModal } from './components/SaveEditorModal';
import { CloudSyncView } from './components/CloudSyncView';
import { DeviceManagerView } from './components/DeviceManagerView';
import { EmulatorPathsModal } from './components/EmulatorPathsModal';
import { CyberblastGame } from './components/game/CyberblastGame';
import { PS5HomeView } from './components/ps5/PS5HomeView';
import { AndroidStealthVaultModal } from './components/AndroidStealthVaultModal';
import { GitHubArtModal } from './components/GitHubArtModal';
import { ConcealmentSettings } from './types/savesync';
import {
  BackdropMode,
  getSavedBackdropMode,
  saveBackdropMode,
  saveLastPlayedId,
  getSavedLastPlayedId,
} from './utils/emulatorThemes';
import {
  downloadGameArtFromGitHub,
  isAutoDownloadFromGitHubEnabled,
} from './utils/githubArtSync';

type NavTab = 'ps5_home' | 'library' | 'cloud' | 'hex' | 'devices' | 'game';

export default function App() {
  // Load persistent state from localStorage or initial mock data
  const [games, setGames] = useState<GameItem[]>(() => {
    const saved = localStorage.getItem('savesync_games');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_GAMES;
  });

  const [devices, setDevices] = useState<SyncDevice[]>(() => {
    const saved = localStorage.getItem('savesync_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DEVICES;
  });

  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(() => {
    const saved = localStorage.getItem('savesync_cloud');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CLOUD_CONFIG;
  });

  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(() => {
    const saved = localStorage.getItem('savesync_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SYNC_LOGS;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('ps5_home');
  const [selectedGameId, setSelectedGameId] = useState<string>(() => games[0]?.id || 'game_cyberblast');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingGameId, setSyncingGameId] = useState<string | null>(null);

  const [concealmentSettings, setConcealmentSettings] = useState<ConcealmentSettings>(() => {
    const saved = localStorage.getItem('savesync_concealment');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CONCEALMENT_SETTINGS;
  });

  // Active Modals state
  const [selectedSlotGame, setSelectedSlotGame] = useState<GameItem | null>(null);
  const [selectedHexGame, setSelectedHexGame] = useState<GameItem | null>(null);
  const [isPathsModalOpen, setIsPathsModalOpen] = useState(false);
  const [isStealthModalOpen, setIsStealthModalOpen] = useState(false);
  const [slotToLoadInRunner, setSlotToLoadInRunner] = useState<SaveSlot | null>(null);
  const [backdropMode, setBackdropMode] = useState<BackdropMode>(() => getSavedBackdropMode());
  const [isGitHubArtModalOpen, setIsGitHubArtModalOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('savesync_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('savesync_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('savesync_cloud', JSON.stringify(cloudConfig));
  }, [cloudConfig]);

  useEffect(() => {
    localStorage.setItem('savesync_logs', JSON.stringify(syncLogs));
  }, [syncLogs]);

  useEffect(() => {
    localStorage.setItem('savesync_concealment', JSON.stringify(concealmentSettings));
  }, [concealmentSettings]);

  // Count unsynced items
  const pendingCount = games.filter((g) => g.cloudSyncStatus === 'pending' || g.cloudSyncStatus === 'conflict').length;

  // Global PS5 Click Sound Listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactiveEl = target.closest('button, a, [role="button"], input[type="checkbox"], select, .cursor-pointer');
      if (interactiveEl) {
        sound.playPS5Click();
      }
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactiveEl = target.closest('button, a, [role="button"]');
      if (interactiveEl && !(interactiveEl as any).__soundHovered) {
        (interactiveEl as any).__soundHovered = true;
        sound.playPS5Focus();
        setTimeout(() => {
          if (interactiveEl) (interactiveEl as any).__soundHovered = false;
        }, 300);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('mouseover', handleGlobalHover);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('mouseover', handleGlobalHover);
    };
  }, []);

  // Duck ambient music when in Live Playable Game
  useEffect(() => {
    if (currentTab === 'game') {
      if (sound.isAmbientPlaying) {
        sound.stopAmbientMusic();
      }
    }
  }, [currentTab]);

  // Auto-Sync Watcher Interval simulation
  useEffect(() => {
    if (!cloudConfig.autoSyncEnabled) return;

    const interval = setInterval(() => {
      // Check if any game has pending sync
      const pendingGame = games.find((g) => g.cloudSyncStatus === 'pending');
      if (pendingGame && !isSyncing) {
        performGameSync(pendingGame.id, false);
      }
    }, cloudConfig.autoSyncIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [cloudConfig.autoSyncEnabled, cloudConfig.autoSyncIntervalSec, games, isSyncing]);

  // Synchronize a specific game to cloud
  const performGameSync = useCallback(
    (gameId: string, playSound = true) => {
      const game = games.find((g) => g.id === gameId);
      if (!game) return;

      setSyncingGameId(gameId);

      setTimeout(() => {
        const topSlot = game.slots[0];
        const newLog: SyncLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          gameId: game.id,
          gameTitle: game.title,
          platform: game.platformName,
          direction: 'upload',
          slotName: topSlot ? topSlot.slotNumber : 'All Slots',
          sizeBytes: topSlot ? topSlot.sizeBytes : 65536,
          durationMs: Math.floor(280 + Math.random() * 450),
          status: 'success',
          details: `Synchronized ${game.slots.length} save slots with Google Drive`,
        };

        setGames((prev) =>
          prev.map((g) => {
            if (g.id !== gameId) return g;
            return {
              ...g,
              cloudSyncStatus: 'synced',
              slots: g.slots.map((s) => ({
                ...s,
                isCloudSynced: true,
                cloudTimestamp: new Date().toISOString(),
                cloudChecksum: s.checksum,
              })),
            };
          })
        );

        setSyncLogs((prev) => [newLog, ...prev.slice(0, 49)]);
        setCloudConfig((prev) => ({
          ...prev,
          lastGlobalSync: new Date().toISOString(),
          usedStorageBytes: prev.usedStorageBytes + (topSlot ? topSlot.sizeBytes : 32000),
        }));

        setSyncingGameId(null);
        if (playSound) sound.playSaveChime();
      }, 700);
    },
    [games]
  );

  // Global "Sync All" action
  const handleSyncAll = useCallback(() => {
    setIsSyncing(true);
    sound.playClick();

    setTimeout(() => {
      const now = new Date().toISOString();
      const updatedGames = games.map((g) => ({
        ...g,
        cloudSyncStatus: 'synced' as const,
        slots: g.slots.map((s) => ({
          ...s,
          isCloudSynced: true,
          cloudTimestamp: now,
        })),
      }));

      const newLog: SyncLogEntry = {
        id: `log_global_${Date.now()}`,
        timestamp: now,
        gameId: 'all',
        gameTitle: 'Full Library Backup',
        platform: 'All Emulators',
        direction: 'upload',
        slotName: 'Global Vault Snapshot',
        sizeBytes: 1024 * 1024 * 12,
        durationMs: 1250,
        status: 'success',
        details: `Successfully backed up ${games.length} titles and resolved pending sync deltas.`,
      };

      setGames(updatedGames);
      setSyncLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      setCloudConfig((prev) => ({
        ...prev,
        lastGlobalSync: now,
      }));
      setIsSyncing(false);
      sound.playSaveChime();
    }, 1200);
  }, [games]);

  // Handle in-game save creation (from CyberblastGame)
  const handleGameSaveCreated = useCallback((newSlot: SaveSlot) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== 'game_cyberblast') return g;

        // Add history entry
        const historyEntry: SaveHistoryEntry = {
          id: `hist_${Date.now()}`,
          timestamp: new Date().toISOString(),
          device: 'Samsung Galaxy S24 Ultra (This Device)',
          action: 'manual_save',
          slotNumber: newSlot.slotNumber,
          checksum: newSlot.checksum,
          note: `In-game checkpoint reached: ${newSlot.name}`,
        };

        return {
          ...g,
          lastPlayed: 'Just now',
          cloudSyncStatus: 'pending', // Triggers auto-sync watcher
          slots: [newSlot, ...g.slots.filter((s) => s.slotNumber !== newSlot.slotNumber)],
          history: [historyEntry, ...g.history],
        };
      })
    );
  }, []);

  // Handle slot branching / forking
  const handleBranchSlot = (gameId: string, baseSlot: SaveSlot, newSlotName: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;

        const branchedSlot: SaveSlot = {
          ...baseSlot,
          id: `slot_branch_${Date.now()}`,
          slotNumber: `Branch (${newSlotName})`,
          name: `${baseSlot.name} [Fork: ${newSlotName}]`,
          timestamp: new Date().toISOString(),
          isCloudSynced: false,
        };

        const hist: SaveHistoryEntry = {
          id: `hist_branch_${Date.now()}`,
          timestamp: new Date().toISOString(),
          device: 'This Device',
          action: 'branch',
          slotNumber: branchedSlot.slotNumber,
          checksum: branchedSlot.checksum,
          note: `Forked timeline from ${baseSlot.slotNumber}`,
        };

        return {
          ...g,
          cloudSyncStatus: 'pending',
          slots: [branchedSlot, ...g.slots],
          history: [hist, ...g.history],
        };
      })
    );
    sound.playClick();
  };

  // Rollback to historic snapshot
  const handleRollbackSlot = (gameId: string, slotId: string, historyEntry: SaveHistoryEntry) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          cloudSyncStatus: 'pending',
          slots: g.slots.map((s) => {
            if (s.id !== slotId) return s;
            return {
              ...s,
              timestamp: new Date().toISOString(),
              checksum: historyEntry.checksum,
              name: `${s.name} (Reverted to ${new Date(historyEntry.timestamp).toLocaleTimeString()})`,
              isCloudSynced: false,
            };
          }),
        };
      })
    );
    sound.playSaveChime();
  };

  // Update slot data from Hex/Field editor
  const handleUpdateSlotData = (
    gameId: string,
    slotId: string,
    updatedData: any,
    newHex: string,
    newChecksum: string
  ) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          cloudSyncStatus: 'pending',
          slots: g.slots.map((s) => {
            if (s.id !== slotId) return s;
            return {
              ...s,
              timestamp: new Date().toISOString(),
              payloadData: updatedData,
              payloadHex: newHex,
              checksum: newChecksum,
              isCloudSynced: false,
            };
          }),
        };
      })
    );
    sound.playSaveChime();
  };

  // Export raw save file download
  const handleExportSlot = (game: GameItem, slot: SaveSlot) => {
    const rawContent = hexToString(slot.payloadHex);
    const blob = new Blob([rawContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.packageOrRomId}_${slot.slotNumber}.sav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Push single slot to cloud
  const handlePushSlotToCloud = (gameId: string, slotId: string) => {
    performGameSync(gameId, true);
  };

  // Import custom file dropped onto library
  const handleImportCustomSave = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const hex = stringToHex(content);
      const checksum = calculateCRC32(content);

      const newSlot: SaveSlot = {
        id: `slot_imported_${Date.now()}`,
        slotNumber: 'Imported File',
        name: file.name,
        timestamp: new Date().toISOString(),
        sizeBytes: file.size,
        inGameLevel: 'Imported State',
        playtime: '1h 00m',
        checksum,
        payloadHex: hex,
        payloadData: {
          playerName: 'Imported User',
          filename: file.name,
          sizeBytes: file.size,
        },
        isCloudSynced: false,
      };

      const newGame: GameItem = {
        id: `game_imported_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        platform: 'retroarch',
        platformName: 'RetroArch / Custom Emulator',
        boxArt: '',
        packageOrRomId: file.name,
        packageName: file.name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
        storagePath: `/storage/emulated/0/RetroArch/saves/${file.name}`,
        saveFormat: file.name.split('.').pop() ? `.${file.name.split('.').pop()}` : '.sav',
        lastPlayed: 'Imported just now',
        totalPlaytime: '1h 00m',
        cloudSyncStatus: 'pending',
        isHiddenFromAndroidHome: concealmentSettings.autoHideOnAdd,
        hideMethod: 'shizuku',
        description: `Imported local save file: ${file.name} (${formatBytes(file.size)}). Concealed from Android Home Screen.`,
        slots: [newSlot],
        history: [],
      };

      setGames((prev) => [newGame, ...prev]);
      sound.playSaveChime();

      // Automatically download & cache backdrop and box art from GitHub repository
      if (isAutoDownloadFromGitHubEnabled()) {
        downloadGameArtFromGitHub(newGame).then((rec) => {
          if (rec?.boxartUrl) {
            setGames((latest) =>
              latest.map((item) =>
                item.id === newGame.id ? { ...item, boxArt: rec.boxartUrl } : item
              )
            );
          }
        });
      }
    };
    reader.readAsText(file);
  };

  // Toggle game concealment from Android Home Screen
  const handleToggleGameHide = (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        const nextState = !g.isHiddenFromAndroidHome;
        return {
          ...g,
          isHiddenFromAndroidHome: nextState,
        };
      })
    );
    sound.playPS5Confirm();
  };

  const handleHideAllGames = () => {
    setGames((prev) => prev.map((g) => ({ ...g, isHiddenFromAndroidHome: true })));
    sound.playPS5Confirm();
  };

  const handleUnhideAllGames = () => {
    setGames((prev) => prev.map((g) => ({ ...g, isHiddenFromAndroidHome: false })));
    sound.playPS5Confirm();
  };

  // Simulate remote conflict
  const handleSimulateConflict = () => {
    setGames((prev) =>
      prev.map((g, idx) => {
        if (idx === 1 || g.id === 'game_chained_fury') {
          return {
            ...g,
            cloudSyncStatus: 'conflict',
            slots: g.slots.map((s, sIdx) =>
              sIdx === 0
                ? {
                    ...s,
                    hasConflict: true,
                    cloudTimestamp: new Date().toISOString(),
                    cloudChecksum: '9FF412A0',
                  }
                : s
            ),
          };
        }
        return g;
      })
    );
    sound.playClick();
  };

  // Resolve conflict
  const handleResolveConflict = (
    gameId: string,
    resolution: 'local' | 'cloud' | 'branch'
  ) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;

        if (resolution === 'branch') {
          const remoteSlot: SaveSlot = {
            id: `slot_remote_fork_${Date.now()}`,
            slotNumber: 'Remote Fork (Retroid Pocket)',
            name: `${g.title} (Cloud Snapshot)`,
            timestamp: new Date().toISOString(),
            sizeBytes: g.slots[0]?.sizeBytes || 65536,
            inGameLevel: 'Remote Level',
            playtime: '20h 15m',
            checksum: '9FF412A0',
            payloadHex: g.slots[0]?.payloadHex || '',
            payloadData: { ...g.slots[0]?.payloadData, note: 'Forked from remote Retroid Pocket' },
            isCloudSynced: true,
          };
          return {
            ...g,
            cloudSyncStatus: 'synced',
            slots: [remoteSlot, ...g.slots.map((s) => ({ ...s, hasConflict: false }))],
          };
        }

        return {
          ...g,
          cloudSyncStatus: 'synced',
          slots: g.slots.map((s) => ({ ...s, hasConflict: false, isCloudSynced: true })),
        };
      })
    );
    sound.playSaveChime();
  };

  // Toggle device sync active
  const handleToggleDeviceSync = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, syncEnabled: !d.syncEnabled } : d))
    );
    sound.playClick();
  };

  // Add new paired device
  const handleAddDevice = (devicePartial: Partial<SyncDevice>) => {
    const fullDevice: SyncDevice = {
      id: devicePartial.id || `dev_${Date.now()}`,
      name: devicePartial.name || 'New Device',
      type: devicePartial.type || 'handheld',
      model: devicePartial.model || 'Android Gaming Device',
      osVersion: devicePartial.osVersion || 'Android 14',
      storageAvailable: devicePartial.storageAvailable || '128 GB free',
      lastActive: new Date().toISOString(),
      isCurrent: false,
      syncEnabled: true,
    };
    setDevices((prev) => [...prev, fullDevice]);
    sound.playSaveChime();
  };

  const activeSelectedGame = games.find((g) => g.id === selectedGameId) || games[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Universal PS5 Top Bar */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        onOpenStealthVault={() => setIsStealthModalOpen(true)}
        concealedCount={games.filter((g) => g.isHiddenFromAndroidHome).length}
        onOpenGitHubArt={() => setIsGitHubArtModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* PS5 Home Screen View */}
        {currentTab === 'ps5_home' && activeSelectedGame && (
          <PS5HomeView
            games={games}
            selectedGame={activeSelectedGame}
            onSelectGame={(g) => setSelectedGameId(g.id)}
            onLaunchGame={(g) => {
              saveLastPlayedId(g.id);
              if (g.isBuiltIn) {
                setCurrentTab('game');
              } else {
                setSelectedSlotGame(g);
              }
            }}
            onOpenSlots={(g) => setSelectedSlotGame(g)}
            onOpenHex={(g) => setSelectedHexGame(g)}
            onSyncGame={(gameId) => performGameSync(gameId, true)}
            onOpenPathsModal={() => setIsPathsModalOpen(true)}
            onImportCustomSave={handleImportCustomSave}
            isSyncingId={syncingGameId}
            cloudConfig={cloudConfig}
            devices={devices}
            onOpenCloudTab={() => setCurrentTab('cloud')}
            onOpenDevicesTab={() => setCurrentTab('devices')}
            onSimulateConflict={handleSimulateConflict}
            onOpenStealthVault={() => setIsStealthModalOpen(true)}
            onToggleHideGame={handleToggleGameHide}
            onOpenGitHubArt={() => setIsGitHubArtModalOpen(true)}
            backdropMode={backdropMode}
            onChangeBackdropMode={(m) => {
              setBackdropMode(m);
              saveBackdropMode(m);
            }}
            lastPlayedGame={games.find((g) => g.id === getSavedLastPlayedId()) || games[0]}
          />
        )}

        {/* Navigation Tab Views */}
        {currentTab === 'library' && (
          <LibraryView
            games={games}
            onOpenSlots={(game) => setSelectedSlotGame(game)}
            onOpenHex={(game) => setSelectedHexGame(game)}
            onSyncGame={(gameId) => performGameSync(gameId, true)}
            onLaunchGame={(game) => {
              saveLastPlayedId(game.id);
              setCurrentTab('game');
            }}
            onOpenPathsModal={() => setIsPathsModalOpen(true)}
            onImportCustomSave={handleImportCustomSave}
            isSyncingId={syncingGameId}
            onOpenStealthVault={() => setIsStealthModalOpen(true)}
            onToggleHideGame={handleToggleGameHide}
            onOpenGitHubArt={() => setIsGitHubArtModalOpen(true)}
          />
        )}

        {currentTab === 'cloud' && (
          <CloudSyncView
            config={cloudConfig}
            logs={syncLogs}
            games={games}
            onUpdateConfig={(up) => setCloudConfig((prev) => ({ ...prev, ...up }))}
            onSyncAll={handleSyncAll}
            onSimulateConflict={handleSimulateConflict}
            onResolveConflict={handleResolveConflict}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === 'hex' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Hex Dump Inspector & Memory Editor</h2>
                <p className="text-xs text-slate-400">
                  Select a title from your library to inspect binary offsets, view ASCII decoding,
                  and patch save variables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedHexGame(g)}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-white">{g.title}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {g.saveFormat} · {g.slots.length} slots
                    </div>
                  </div>
                  <div className="text-xs text-sky-400 font-mono">Inspect Hex →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'devices' && (
          <DeviceManagerView
            devices={devices}
            games={games}
            onToggleDeviceSync={handleToggleDeviceSync}
            onAddDevice={handleAddDevice}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === 'game' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Live Playable Sandbox: Cyberblast Adventures
                </h2>
                <p className="text-xs text-slate-400">
                  Real 60fps arcade shooter testbed. Progressing sectors triggers live binary saves
                  that sync with your cloud dashboard.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSlotGame(games.find((g) => g.id === 'game_cyberblast') || null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                >
                  View Game Save Slots
                </button>
                <button
                  onClick={() => setCurrentTab('library')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Back to Library
                </button>
              </div>
            </div>

            {/* Embedded 60fps Game */}
            <CyberblastGame
              onSaveCreated={handleGameSaveCreated}
              onExit={() => setCurrentTab('library')}
              loadSlot={slotToLoadInRunner}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <SlotManagerModal
        game={selectedSlotGame}
        onClose={() => setSelectedSlotGame(null)}
        onBranchSlot={handleBranchSlot}
        onRollbackSlot={handleRollbackSlot}
        onLoadIntoRunner={(slot) => {
          setSlotToLoadInRunner(slot);
          setCurrentTab('game');
        }}
        onExportSlot={handleExportSlot}
        onPushSlotToCloud={handlePushSlotToCloud}
      />

      <SaveEditorModal
        game={selectedHexGame}
        onClose={() => setSelectedHexGame(null)}
        onUpdateSlotData={handleUpdateSlotData}
      />

      <EmulatorPathsModal
        isOpen={isPathsModalOpen}
        onClose={() => setIsPathsModalOpen(false)}
      />

      <AndroidStealthVaultModal
        isOpen={isStealthModalOpen}
        onClose={() => setIsStealthModalOpen(false)}
        games={games}
        settings={concealmentSettings}
        onToggleGameHide={handleToggleGameHide}
        onUpdateSettings={(up) => setConcealmentSettings((prev) => ({ ...prev, ...up }))}
        onHideAllGames={handleHideAllGames}
        onUnhideAllGames={handleUnhideAllGames}
      />

      {/* GitHub Emulator Art & Backdrop Modal */}
      <GitHubArtModal
        isOpen={isGitHubArtModalOpen}
        onClose={() => setIsGitHubArtModalOpen(false)}
        games={games}
        currentMode={backdropMode}
        onChangeMode={(m) => setBackdropMode(m)}
        lastPlayedTitle={
          games.find((g) => g.id === getSavedLastPlayedId())?.title || 'Cyberblast Adventures'
        }
        onRefreshArt={() => {
          setGames((prev) => [...prev]);
        }}
      />
    </div>
  );
}
