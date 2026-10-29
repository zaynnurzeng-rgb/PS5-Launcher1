import React, { useState } from 'react';
import { EMULATOR_PRESET_PATHS, EmulatorPresetPath } from '../types/savesync';
import { X, FolderOpen, Copy, Check, ShieldAlert, ExternalLink, HardDrive } from 'lucide-react';

interface EmulatorPathsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmulatorPathsModal: React.FC<EmulatorPathsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Android Emulator Save Paths & Scoped Storage Matrix
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Android 11–15 Scoped Storage (/Android/data/) and external directory mappings
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

        {/* Scoped storage alert */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-start gap-3 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Scoped Storage Note (Android 13+): </span>
            The <span className="font-mono text-sky-400">/Android/data/</span> folder is protected
            by Google's Storage Access Framework (SAF). SaveSync uses direct SAF folder URIs and
            Shizuku/Sui privilege grants to watch and sync files without requiring root access.
          </div>
        </div>

        {/* Directory Presets List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {EMULATOR_PRESET_PATHS.map((preset) => {
              const isCopied = copiedPath === preset.defaultPath;
              return (
                <div
                  key={preset.platform}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{preset.name}</span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">
                        ({preset.system})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                      {preset.saveExtension}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded text-xs font-mono text-sky-300 select-all truncate">
                      {preset.defaultPath}
                    </code>
                    <button
                      onClick={() => handleCopy(preset.defaultPath)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Path</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">{preset.notes}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Need custom directories? You can drop save files directly onto the library.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded text-xs transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
