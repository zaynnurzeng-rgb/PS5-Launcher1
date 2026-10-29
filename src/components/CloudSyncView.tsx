import React, { useState } from 'react';
import { CloudConfig, SyncLogEntry, GameItem, CloudProvider } from '../types/savesync';
import { formatBytes, formatRelativeTime } from '../utils/hexHelper';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Smartphone,
  Sliders,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  FileCheck,
  Zap,
} from 'lucide-react';

interface CloudSyncViewProps {
  config: CloudConfig;
  logs: SyncLogEntry[];
  games: GameItem[];
  onUpdateConfig: (updated: Partial<CloudConfig>) => void;
  onSyncAll: () => void;
  onSimulateConflict: () => void;
  onResolveConflict: (gameId: string, resolution: 'local' | 'cloud' | 'branch') => void;
  isSyncing: boolean;
}

export const CloudSyncView: React.FC<CloudSyncViewProps> = ({
  config,
  logs,
  games,
  onUpdateConfig,
  onSyncAll,
  onSimulateConflict,
  onResolveConflict,
  isSyncing,
}) => {
  const [activeConflictGameId, setActiveConflictGameId] = useState<string | null>(null);

  const conflictGames = games.filter((g) => g.cloudSyncStatus === 'conflict');
  const usedPercent = Math.min(100, Math.round((config.usedStorageBytes / config.totalStorageBytes) * 100));

  return (
    <div className="space-y-6">
      {/* Cloud Service Header & Quota Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Google Drive Cloud Synchronization</h2>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Account: {config.accountEmail} · Target: /Android/SaveSync/
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSimulateConflict}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title="Test real conflict resolution mechanism"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Cloud Conflict</span>
            </button>

            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Vault Now'}</span>
            </button>
          </div>
        </div>

        {/* Quota & Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>CLOUD STORAGE USED</span>
              <span className="text-slate-200">
                {formatBytes(config.usedStorageBytes)} / {formatBytes(config.totalStorageBytes)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, usedPercent)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-mono">LAST GLOBAL SYNC</div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {formatRelativeTime(config.lastGlobalSync)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-mono">ENCRYPTION PROTOCOL</div>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-1 text-sm font-mono">
              <ShieldCheck className="w-4 h-4" /> AES-256 GCM Client-Side
            </div>
          </div>
        </div>
      </div>

      {/* Active Conflict Resolution Alert Banner */}
      {conflictGames.length > 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Save Conflict Detected ({conflictGames.length} title requiring resolution)
            </span>
          </div>
          <p className="text-xs text-slate-300">
            A newer save was uploaded from another handheld console (e.g. Retroid Pocket 4 Pro).
            Choose how to reconcile timestamps without losing game progress.
          </p>

          <div className="space-y-2 pt-1">
            {conflictGames.map((game) => (
              <div
                key={game.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{game.title}</div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Local: {new Date(game.slots[0]?.timestamp || '').toLocaleTimeString()} · Remote:{' '}
                    {new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onResolveConflict(game.id, 'branch')}
                    className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded font-medium transition-colors"
                  >
                    Branch Both (Zero Risk)
                  </button>
                  <button
                    onClick={() => onResolveConflict(game.id, 'local')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                  >
                    Keep Local Device
                  </button>
                  <button
                    onClick={() => onResolveConflict(game.id, 'cloud')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                  >
                    Keep Cloud Remote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synchronization Engine Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Auto-Sync Watcher</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">
                Watcher Polling Interval
              </label>
              <select
                value={config.autoSyncIntervalSec}
                onChange={(e) =>
                  onUpdateConfig({ autoSyncIntervalSec: parseInt(e.target.value) || 15 })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-none focus:border-sky-500"
              >
                <option value={5}>Every 5 seconds (Real-Time Handheld)</option>
                <option value={15}>Every 15 seconds (Balanced)</option>
                <option value={60}>Every 1 minute (Battery Saver)</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">
                Cloud Provider Backend
              </label>
              <select
                value={config.provider}
                onChange={(e) => onUpdateConfig({ provider: e.target.value as CloudProvider })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-none focus:border-sky-500"
              >
                <option value="google_drive">Google Drive API v3</option>
                <option value="webdav">Nextcloud / WebDAV Server</option>
                <option value="vault">SaveSync Private Vault</option>
                <option value="dropbox">Dropbox Scoped Storage</option>
              </select>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={config.autoSyncEnabled}
                  onChange={(e) => onUpdateConfig({ autoSyncEnabled: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Enable Background File Watcher</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={config.syncOnSaveDetected}
                  onChange={(e) => onUpdateConfig({ syncOnSaveDetected: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Instant upload on write detected</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={config.syncOnGameClose}
                  onChange={(e) => onUpdateConfig({ syncOnGameClose: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Auto-sync when emulator suspends</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Sync Activity Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Real-Time Cloud Activity Log</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing last {logs.length} transfers
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px]">
            {logs.map((log) => {
              const isUpload = log.direction === 'upload';
              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isUpload
                          ? 'bg-sky-500/10 text-sky-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {isUpload ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">
                        {log.gameTitle} · <span className="text-slate-400">{log.slotName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0 ml-3">
                    <div className="text-slate-300 font-semibold">
                      {formatBytes(log.sizeBytes)} · {log.durationMs}ms
                    </div>
                    <div className="text-slate-500">{formatRelativeTime(log.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
