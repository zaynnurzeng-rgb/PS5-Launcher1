import React, { useState, useMemo } from 'react';
import { GameItem, SaveSlot } from '../types/savesync';
import { generateHexDump, stringToHex, hexToString, calculateCRC32, formatBytes } from '../utils/hexHelper';
import { X, Binary, Download, Save, Search, CheckCircle2, RefreshCw } from 'lucide-react';

interface SaveEditorModalProps {
  game: GameItem | null;
  onClose: () => void;
  onUpdateSlotData: (gameId: string, slotId: string, updatedData: any, newHex: string, newChecksum: string) => void;
}

export const SaveEditorModal: React.FC<SaveEditorModalProps> = ({
  game,
  onClose,
  onUpdateSlotData,
}) => {
  if (!game) return null;

  const [selectedSlotId, setSelectedSlotId] = useState<string>(game.slots[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'hex' | 'fields'>('hex');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedByteOffset, setSelectedByteOffset] = useState<number | null>(null);

  const slot = game.slots.find((s) => s.id === selectedSlotId) || game.slots[0];

  // Editable fields state
  const [formData, setFormData] = useState({
    playerName: slot?.payloadData?.playerName || 'Player',
    hp: slot?.payloadData?.hp ?? 100,
    score: slot?.payloadData?.score ?? 0,
    currency: slot?.payloadData?.currency ?? 0,
    level: slot?.payloadData?.level ?? 1,
    location: slot?.payloadData?.location || 'Sanctuary',
  });

  // Keep form in sync when slot changes
  React.useEffect(() => {
    if (slot) {
      setFormData({
        playerName: slot.payloadData?.playerName || 'Player',
        hp: slot.payloadData?.hp ?? 100,
        score: slot.payloadData?.score ?? 0,
        currency: slot.payloadData?.currency ?? 0,
        level: slot.payloadData?.level ?? 1,
        location: slot.payloadData?.location || 'Sanctuary',
      });
    }
  }, [slot?.id]);

  // Compute hex rows
  const hexRows = useMemo(() => {
    if (!slot) return [];
    return generateHexDump(slot.payloadHex);
  }, [slot?.payloadHex]);

  // Handle saving modified fields
  const handleSaveFields = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;

    const updatedPayload = {
      ...slot.payloadData,
      ...formData,
    };
    const jsonStr = JSON.stringify(updatedPayload);
    const newHex = stringToHex(jsonStr);
    const newChecksum = calculateCRC32(jsonStr);

    onUpdateSlotData(game.id, slot.id, updatedPayload, newHex, newChecksum);
    alert(`Save slot "${slot.slotNumber}" updated successfully!\nNew CRC32: ${newChecksum}`);
  };

  // Download raw file
  const handleDownloadFile = () => {
    if (!slot) return;
    const blob = new Blob([hexToString(slot.payloadHex)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.packageOrRomId.replace(/[^a-zA-Z0-9]/g, '_')}_${slot.slotNumber.replace(/[^a-zA-Z0-9]/g, '_')}.sav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Hex Inspector & Memory Editor
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {game.title} · {game.saveFormat} · Checksum: {slot?.checksum}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download .sav</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slot Selector & Mode Switch */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Active Slot:</span>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500"
            >
              {game.slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slotNumber} - {s.name} ({formatBytes(s.sizeBytes)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('hex')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'hex' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Hex Dump
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'fields' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Structured Save Variables
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'hex' ? (
            <div className="space-y-3 font-mono">
              {/* Hex viewer controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span>Showing 16 bytes/row</span>
                  <span>·</span>
                  <span>Total Bytes: {slot ? slot.payloadHex.length / 2 : 0} B</span>
                  {selectedByteOffset !== null && (
                    <>
                      <span>·</span>
                      <span className="text-amber-400 font-semibold">
                        Offset: 0x{selectedByteOffset.toString(16).toUpperCase().padStart(4, '0')}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Click any hex pair to view offset and ASCII mapping
                </div>
              </div>

              {/* Hex Dump Table */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto text-xs leading-relaxed max-h-[480px]">
                <div className="grid grid-cols-[80px_1fr_160px] gap-4 font-mono text-slate-500 pb-2 border-b border-slate-800/60 mb-2 font-semibold">
                  <div>OFFSET</div>
                  <div>00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</div>
                  <div>ASCII DECODING</div>
                </div>

                <div className="space-y-1">
                  {hexRows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-[80px_1fr_160px] gap-4 font-mono hover:bg-slate-900/60 rounded px-1 transition-colors"
                    >
                      {/* Offset address */}
                      <span className="text-sky-400 select-all">{row.offset}</span>

                      {/* 16 Hex bytes */}
                      <div className="flex gap-1.5 text-slate-300">
                        {row.bytes.map((byte, bIdx) => {
                          const byteOffset = rowIdx * 16 + bIdx;
                          const isSelected = selectedByteOffset === byteOffset;
                          return (
                            <span
                              key={bIdx}
                              onClick={() => setSelectedByteOffset(byteOffset)}
                              className={`cursor-pointer px-0.5 rounded transition-colors ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : 'hover:text-amber-300'
                              } ${bIdx === 7 ? 'mr-2' : ''}`}
                            >
                              {byte}
                            </span>
                          );
                        })}
                      </div>

                      {/* ASCII rendering */}
                      <span className="text-emerald-400 tracking-wider truncate select-all">
                        {row.ascii}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Structured Fields Form
            <form onSubmit={handleSaveFields} className="max-w-2xl mx-auto space-y-4 py-4">
              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
                  EDIT SAVE ATTRIBUTES & VALUES
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Player Name / Character
                    </label>
                    <input
                      type="text"
                      value={formData.playerName}
                      onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Health / Shield Capacity (HP)
                    </label>
                    <input
                      type="number"
                      value={formData.hp}
                      onChange={(e) =>
                        setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Score / Experience
                    </label>
                    <input
                      type="number"
                      value={formData.score}
                      onChange={(e) =>
                        setFormData({ ...formData, score: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Credits / Gold / Currency
                    </label>
                    <input
                      type="number"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Level / Act / Sector
                    </label>
                    <input
                      type="number"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Checkpoint / Location Tag
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 font-mono">
                  Submitting will recalculate the CRC32 checksum and rewrite the binary hex block.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes & Recompute CRC</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
