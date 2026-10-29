import React, { useState } from 'react';
import { SyncDevice, GameItem } from '../types/savesync';
import { formatRelativeTime } from '../utils/hexHelper';
import {
  Smartphone,
  Gamepad,
  Monitor,
  CheckCircle2,
  Plus,
  RefreshCw,
  HardDrive,
  Cpu,
  Radio,
  ArrowRightLeft,
} from 'lucide-react';

interface DeviceManagerViewProps {
  devices: SyncDevice[];
  games: GameItem[];
  onToggleDeviceSync: (deviceId: string) => void;
  onAddDevice: (device: Partial<SyncDevice>) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export const DeviceManagerView: React.FC<DeviceManagerViewProps> = ({
  devices,
  games,
  onToggleDeviceSync,
  onAddDevice,
  onSyncAll,
  isSyncing,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'phone' | 'handheld' | 'pc_emulator'>('handheld');

  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    onAddDevice({
      id: `dev_${Date.now()}`,
      name: newDeviceName.trim(),
      model: newDeviceModel.trim() || 'Android Gaming Device',
      type: newDeviceType,
      osVersion: 'Android 14',
      storageAvailable: '128 GB free',
      lastActive: new Date().toISOString(),
      isCurrent: false,
      syncEnabled: true,
    });

    setNewDeviceName('');
    setNewDeviceModel('');
    setShowAddModal(false);
  };

  const getDeviceIcon = (type: SyncDevice['type']) => {
    switch (type) {
      case 'handheld':
        return <Gamepad className="w-5 h-5 text-sky-400" />;
      case 'pc_emulator':
        return <Monitor className="w-5 h-5 text-amber-400" />;
      default:
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white">Cross-Device Synchronization Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronize emulator memory cards and state slots across your phone, gaming handhelds,
            and desktop emulator instances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pair New Device</span>
          </button>

          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Broadcast Sync</span>
          </button>
        </div>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
              device.isCurrent
                ? 'bg-slate-900/90 border-sky-500/50 shadow-md'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{device.name}</h3>
                      {device.isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/30">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{device.model}</div>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={device.syncEnabled}
                    onChange={() => onToggleDeviceSync(device.id)}
                    className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span className="text-slate-400 font-mono text-[11px]">Sync Active</span>
                </label>
              </div>

              {/* Hardware Specs & Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">OS VERSION</span>
                  <span className="text-slate-300 font-medium truncate block">
                    {device.osVersion}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOCAL STORAGE</span>
                  <span className="text-slate-300 font-medium truncate block">
                    {device.storageAvailable}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LAST CONTACT</span>
                  <span className="text-slate-300 font-medium truncate block">
                    {formatRelativeTime(device.lastActive)}
                  </span>
                </div>
              </div>
            </div>

            {/* Device-Specific Status */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Ready for remote delta pull</span>
              </div>
              <button
                onClick={onSyncAll}
                className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 text-[11px]"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Pull Saves</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDeviceSubmit}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-base text-white">Pair New Gaming Device</h3>
            <p className="text-xs text-slate-400">
              Add your secondary handheld, retro console, or emulator install to receive cloud save
              pushes.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Device Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AYN Odin 2 Pro, Steam Deck OLED"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Model / Hardware</label>
                <input
                  type="text"
                  placeholder="e.g. SD 8 Gen 2 / 12GB RAM"
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Device Category</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="handheld">Handheld Gaming Console (Retroid / Odin / Anbernic)</option>
                  <option value="phone">Android Smartphone / Tablet</option>
                  <option value="pc_emulator">PC Android Emulator (BlueStacks / LDPlayer / MuMu)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded text-xs transition-colors"
              >
                Add Device
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
