import React, { useState } from 'react';
import { GameItem, SaveSlot, SaveHistoryEntry } from '../types/savesync';
import { formatBytes, calculateCRC32 } from '../utils/hexHelper';
import {
  X,
  Bookmark,
  GitBranch,
  History,
  Download,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
} from 'lucide-react';

interface SlotManagerModalProps {
  game: GameItem | null;
  onClose: () => void;
  onBranchSlot: (gameId: string, baseSlot: SaveSlot, newSlotName: string) => void;
  onRollbackSlot: (gameId: string, slotId: string, historyEntry: SaveHistoryEntry) => void;
  onLoadIntoRunner?: (slot: SaveSlot) => void;
  onExportSlot: (game: GameItem, slot: SaveSlot) => void;
  onPushSlotToCloud: (gameId: string, slotId: string) => void;
}

export const SlotManagerModal: React.FC<SlotManagerModalProps> = ({
  game,
  onClose,
  onBranchSlot,
  onRollbackSlot,
  onLoadIntoRunner,
  onExportSlot,
  onPushSlotToCloud,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [isBranching, setIsBranching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'history' | 'diff'>('slots');

  if (!game) return null;

  const currentSlot = game.slots.find((s) => s.id === selectedSlotId) || game.slots[0];

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !currentSlot) return;
    onBranchSlot(game.id, currentSlot, branchName.trim());
    setBranchName('');
    setIsBranching(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{game.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{game.platformName}</span>
                <span aria-hidden="true">·</span>
                <span>{game.slots.length} Saved States & Battery Slots</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'slots'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Save Slots ({game.slots.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Snapshot Timeline ({game.history.length})
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'diff'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Local vs Cloud Comparison
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'slots' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Slot Selector List */}
              <div className="space-y-2 md:col-span-1 border-r border-slate-800/80 pr-4">
                <div className="text-xs font-semibold text-slate-400 mb-2">SELECT SAVE SLOT</div>
                {game.slots.map((slot) => {
                  const isSelected = currentSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-sky-500/60 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                        <span>{slot.slotNumber}</span>
                        {slot.isCloudSynced ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate">{slot.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        {new Date(slot.timestamp).toLocaleTimeString()} · {formatBytes(slot.sizeBytes)}
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsBranching(true)}
                  className="w-full mt-3 py-2 px-3 border border-dashed border-slate-700 hover:border-sky-500/60 text-slate-400 hover:text-sky-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Branch Selected Slot</span>
                </button>
              </div>

              {/* Right Column: Selected Slot Deep Inspection & Actions */}
              {currentSlot ? (
                <div className="md:col-span-2 space-y-5">
                  {/* Branch Form if toggled */}
                  {isBranching && (
                    <form
                      onSubmit={handleCreateBranch}
                      className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-lg space-y-2"
                    >
                      <div className="text-xs font-semibold text-sky-300">
                        Fork Save Slot: Create Safe Alternative Timeline
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Hardcore Boss Attempt, Route B"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded"
                        >
                          Confirm Branch
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBranching(false)}
                          className="px-2.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Slot Overview Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-white">{currentSlot.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ID: {currentSlot.id} · Slot: {currentSlot.slotNumber}
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="text-slate-300 font-semibold">
                          {formatBytes(currentSlot.sizeBytes)}
                        </div>
                        <div className="text-slate-500">CRC: {currentSlot.checksum}</div>
                      </div>
                    </div>

                    {/* Extracted Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[11px]">IN-GAME LEVEL</span>
                        <span className="text-slate-200 font-semibold">
                          {currentSlot.inGameLevel || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">RECORDED PLAYTIME</span>
                        <span className="text-slate-200 font-semibold">{currentSlot.playtime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">CLOUD SYNC STATE</span>
                        <span
                          className={`font-semibold ${
                            currentSlot.isCloudSynced ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {currentSlot.isCloudSynced ? 'Uploaded' : 'Pending Upload'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">LAST MODIFIED</span>
                        <span className="text-slate-200">
                          {new Date(currentSlot.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Decoded Variables */}
                    {currentSlot.payloadData && (
                      <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs font-mono">
                        <div className="text-slate-400 mb-2 font-semibold">DECODED SAVE VARIABLES</div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          {Object.entries(currentSlot.payloadData).map(([key, value]) => (
                            <div key={key} className="truncate">
                              <span className="text-slate-500">{key}: </span>
                              <span className="text-sky-300">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {game.isBuiltIn && onLoadIntoRunner && (
                      <button
                        onClick={() => {
                          onLoadIntoRunner(currentSlot);
                          onClose();
                        }}
                        className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Live Game From This State</span>
                      </button>
                    )}

                    <button
                      onClick={() => onPushSlotToCloud(game.id, currentSlot.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                      <span>Push Slot to Cloud</span>
                    </button>

                    <button
                      onClick={() => onExportSlot(game, currentSlot)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export Raw Save File</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 text-center py-12 text-slate-500 text-xs">
                  No save slot selected.
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Audit trail of all save events, cloud pushes, downloads, and branch forks for{' '}
                <span className="text-slate-200 font-semibold">{game.title}</span>.
              </div>

              {game.history.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800 text-xs text-slate-500">
                  No previous rollback snapshots recorded yet for this title. New in-game checkpoints
                  will log history automatically.
                </div>
              ) : (
                <div className="space-y-2">
                  {game.history.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <History className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-200">
                            {hist.slotNumber} · {hist.action.toUpperCase()}
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                            {hist.note} · Device: {hist.device}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono text-[11px] text-slate-500">
                          <div>{new Date(hist.timestamp).toLocaleTimeString()}</div>
                          <div>CRC: {hist.checksum}</div>
                        </div>

                        {currentSlot && (
                          <button
                            onClick={() => onRollbackSlot(game.id, currentSlot.id, hist)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 font-mono transition-colors"
                            title="Revert current slot to this point"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Revert</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diff Tab */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Side-by-side integrity comparison between the local Android device slot and the
                remote Google Drive cloud snapshot.
              </div>

              {currentSlot ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local Column */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-sky-400 border-b border-slate-800 pb-2">
                      <span>LOCAL ANDROID STATE</span>
                      <span className="font-mono text-slate-400">Device: Galaxy S24 Ultra</span>
                    </div>
                    <div className="space-y-1.5 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">Timestamp: </span>
                        {new Date(currentSlot.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-slate-500">Size: </span>
                        {formatBytes(currentSlot.sizeBytes)}
                      </div>
                      <div>
                        <span className="text-slate-500">Checksum (CRC32): </span>
                        <span className="text-amber-400 font-bold">{currentSlot.checksum}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Playtime: </span>
                        {currentSlot.playtime}
                      </div>
                      <div>
                        <span className="text-slate-500">Progress: </span>
                        {currentSlot.inGameLevel}
                      </div>
                    </div>
                  </div>

                  {/* Cloud Column */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 border-b border-slate-800 pb-2">
                      <span>REMOTE CLOUD VAULT</span>
                      <span className="font-mono text-slate-400">Provider: Google Drive</span>
                    </div>
                    <div className="space-y-1.5 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">Timestamp: </span>
                        {currentSlot.cloudTimestamp
                          ? new Date(currentSlot.cloudTimestamp).toLocaleString()
                          : 'Not yet uploaded'}
                      </div>
                      <div>
                        <span className="text-slate-500">Size: </span>
                        {formatBytes(currentSlot.sizeBytes)}
                      </div>
                      <div>
                        <span className="text-slate-500">Checksum (CRC32): </span>
                        <span className="text-emerald-400 font-bold">
                          {currentSlot.isCloudSynced ? currentSlot.checksum : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status: </span>
                        {currentSlot.isCloudSynced ? (
                          <span className="text-emerald-400">100% In-Sync (Exact Match)</span>
                        ) : (
                          <span className="text-amber-400">Local is newer (+1 delta)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No slot selected.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
