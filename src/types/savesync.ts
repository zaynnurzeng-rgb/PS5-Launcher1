export type EmulatorPlatform =
  | 'ppsspp'
  | 'aethersx2'
  | 'citra'
  | 'dolphin'
  | 'skyline'
  | 'retroarch'
  | 'duckstation'
  | 'native_android'
  | 'builtin_runner';

export interface SaveSlot {
  id: string;
  slotNumber: string; // e.g. "QuickSave", "Slot 1", "Slot 2", "AutoSave", "Memory Card A"
  name: string;
  timestamp: string;
  sizeBytes: number;
  inGameLevel: string | number;
  playtime: string;
  checksum: string;
  payloadHex: string;
  payloadData: {
    playerName?: string;
    level?: number;
    score?: number;
    hp?: number;
    currency?: number;
    location?: string;
    chapter?: string;
    difficulty?: string;
    filename?: string;
    sizeBytes?: number;
    note?: string;
    customFlags?: Record<string, any>;
    [key: string]: any;
  };
  isCloudSynced: boolean;
  cloudTimestamp?: string;
  cloudChecksum?: string;
  hasConflict?: boolean;
}

export interface SaveHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  action: 'manual_save' | 'cloud_push' | 'cloud_pull' | 'rollback' | 'branch' | 'hex_edit';
  slotNumber: string;
  checksum: string;
  note: string;
}

export interface GameItem {
  id: string;
  title: string;
  platform: EmulatorPlatform;
  platformName: string;
  boxArt: string;
  packageOrRomId: string;
  storagePath: string;
  saveFormat: string; // e.g., ".sav", ".srm", ".mcd", ".bin", ".dat"
  lastPlayed: string;
  totalPlaytime: string;
  cloudSyncStatus: 'synced' | 'pending' | 'conflict' | 'syncing';
  slots: SaveSlot[];
  history: SaveHistoryEntry[];
  description: string;
  isBuiltIn?: boolean;
  // Android Home Screen Concealment (Stealth Vault / Isolated App Drawer)
  isHiddenFromAndroidHome: boolean;
  packageName?: string;
  hideMethod?: 'shizuku' | 'adb' | 'private_space' | 'launcher_alias' | 'samsung_game_space';
}

export interface ConcealmentSettings {
  autoHideOnAdd: boolean;
  shizukuConnected: boolean;
  stealthModeEnabled: boolean;
  activeHideMethod: 'shizuku' | 'adb' | 'private_space' | 'launcher_alias';
  lastStatusLog: string;
}

export interface SyncDevice {
  id: string;
  name: string;
  type: 'phone' | 'handheld' | 'pc_emulator' | 'tablet';
  model: string;
  osVersion: string;
  storageAvailable: string;
  lastActive: string;
  isCurrent: boolean;
  syncEnabled: boolean;
}

export type CloudProvider = 'google_drive' | 'webdav' | 'vault' | 'dropbox';

export interface CloudConfig {
  provider: CloudProvider;
  accountEmail: string;
  connected: boolean;
  autoSyncEnabled: boolean;
  autoSyncIntervalSec: number;
  syncOnGameClose: boolean;
  syncOnSaveDetected: boolean;
  conflictStrategy: 'ask' | 'prefer_local' | 'prefer_cloud' | 'auto_branch';
  usedStorageBytes: number;
  totalStorageBytes: number;
  lastGlobalSync: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  gameId: string;
  gameTitle: string;
  platform: string;
  direction: 'upload' | 'download' | 'conflict_resolved';
  slotName: string;
  sizeBytes: number;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export interface EmulatorPresetPath {
  platform: EmulatorPlatform;
  name: string;
  system: string;
  defaultPath: string;
  saveExtension: string;
  notes: string;
}

export const EMULATOR_PRESET_PATHS: EmulatorPresetPath[] = [
  {
    platform: 'ppsspp',
    name: 'PPSSPP',
    system: 'Sony PlayStation Portable',
    defaultPath: '/storage/emulated/0/PSP/SAVEDATA/',
    saveExtension: '.bin / PARAM.SFO',
    notes: 'Directory per title (e.g. ULUS10391). Scoped storage requires All Files Access.',
  },
  {
    platform: 'aethersx2',
    name: 'AetherSX2 / NetherSX2',
    system: 'Sony PlayStation 2',
    defaultPath: '/Android/data/xyz.aethersx2.android/files/memcards/',
    saveExtension: 'Mcd001.ps2 / .sav',
    notes: 'Virtual 8MB PS2 memory cards and savestates in /sstates/.',
  },
  {
    platform: 'citra',
    name: 'Citra / Lime3DS',
    system: 'Nintendo 3DS',
    defaultPath: '/Android/data/org.citra.emu/files/sdmc/Nintendo 3DS/',
    saveExtension: 'main / main.bak',
    notes: 'Hex title ID directory structure (0004000000...) contains raw saves.',
  },
  {
    platform: 'dolphin',
    name: 'Dolphin Emulator',
    system: 'Nintendo GameCube & Wii',
    defaultPath: '/Android/data/org.dolphinemu.dolphinemu/files/User/GC/',
    saveExtension: '.gci / .raw / .sav',
    notes: 'Supports raw memory card slot A/B or individual GCI virtual saves.',
  },
  {
    platform: 'skyline',
    name: 'Skyline / Strato / Yuzu',
    system: 'Nintendo Switch',
    defaultPath: '/Android/data/skyline.emu/files/switch/nand/user/save/',
    saveExtension: '.bin / slot folders',
    notes: 'Encrypted or decrypted NAND user saves mapped by TitleID and AccountID.',
  },
  {
    platform: 'retroarch',
    name: 'RetroArch (Libretro)',
    system: 'Multi-System (GBA, SNES, Genesis, Arcade)',
    defaultPath: '/storage/emulated/0/RetroArch/saves/',
    saveExtension: '.srm / .state',
    notes: 'Unified save SRAM folder across all loaded Libretro cores.',
  },
  {
    platform: 'duckstation',
    name: 'DuckStation',
    system: 'Sony PlayStation 1',
    defaultPath: '/Android/data/com.github.stenzek.duckstation/files/memcards/',
    saveExtension: '.mcd / .sav',
    notes: 'Dedicated 128KB PS1 memory card images with per-game titles.',
  },
  {
    platform: 'native_android',
    name: 'Native Android Games',
    system: 'Android Scoped Storage (Data & Media)',
    defaultPath: '/Android/data/<package_name>/files/',
    saveExtension: '.dat / .json / .save',
    notes: 'Direct application sandbox storage. Root or Shizuku/SAF access needed for private folders.',
  },
];
