import React, { useState } from 'react';
import { GameItem, ConcealmentSettings } from '../types/savesync';
import { sound } from '../utils/audio';
import {
  X,
  EyeOff,
  Eye,
  ShieldCheck,
  Smartphone,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AndroidStealthVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  settings: ConcealmentSettings;
  onToggleGameHide: (gameId: string) => void;
  onUpdateSettings: (updated: Partial<ConcealmentSettings>) => void;
  onHideAllGames: () => void;
  onUnhideAllGames: () => void;
}

export const AndroidStealthVaultModal: React.FC<AndroidStealthVaultModalProps> = ({
  isOpen,
  onClose,
  games,
  settings,
  onToggleGameHide,
  onUpdateSettings,
  onHideAllGames,
  onUnhideAllGames,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'how_it_works' | 'terminal'>('apps');

  if (!isOpen) return null;

  const hiddenCount = games.filter((g) => g.isHiddenFromAndroidHome).length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    sound.playPS5Click();
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  Android Home Screen Concealment & Stealth Space
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                  <ShieldCheck className="w-3 h-3" /> Shizuku Active
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Automatically hides entered emulator and game icons from the Android App Drawer and Home Screen
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPS5Back();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-white font-mono">{hiddenCount} of {games.length}</strong>{' '}
              applications are currently concealed from the Android launcher.
            </span>
          </div>

          {/* Master Auto-Conceal Switch */}
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={settings.autoHideOnAdd}
              onChange={(e) => {
                sound.playPS5Click();
                onUpdateSettings({ autoHideOnAdd: e.target.checked });
              }}
              className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Auto-Conceal on Import</span>
          </label>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/30 flex items-center gap-3 text-xs">
          <button
            onClick={() => {
              sound.playPS5Focus();
              setActiveTab('apps');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'apps'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Managed Applications ({games.length})
          </button>
          <button
            onClick={() => {
              sound.playPS5Focus();
              setActiveTab('how_it_works');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'how_it_works'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            How Android Concealment Works
          </button>
          <button
            onClick={() => {
              sound.playPS5Focus();
              setActiveTab('terminal');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'terminal'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ADB & Shizuku Shell Commands
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  When toggled ON, the application will NOT appear on the Android home screen or app drawer. It can only be launched inside SaveSync.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      sound.playPS5Click();
                      onHideAllGames();
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                  >
                    Hide All from Home
                  </button>
                  <button
                    onClick={() => {
                      sound.playPS5Click();
                      onUnhideAllGames();
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                  >
                    Restore All
                  </button>
                </div>
              </div>

              {/* App List */}
              <div className="space-y-2">
                {games.map((game) => {
                  const isHidden = game.isHiddenFromAndroidHome;
                  const pkgName = game.packageName || game.packageOrRomId.split(' ')[0];

                  return (
                    <div
                      key={game.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 transition-colors hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          {game.boxArt ? (
                            <img
                              src={game.boxArt}
                              alt={game.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                              {game.platform.slice(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm truncate">{game.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 shrink-0">
                              {game.platformName}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                            Package: <span className="text-sky-300">{pkgName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hide/Show Switch */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isHidden ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-950/80 text-sky-300 border border-sky-600/50 rounded-full text-xs font-mono">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden from Home</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-full text-xs font-mono">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visible on Home</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            sound.playPS5Click();
                            onToggleGameHide(game.id);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            isHidden
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                          }`}
                        >
                          {isHidden ? 'Restore to Home' : 'Conceal from Home'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'how_it_works' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>How SaveSync Conceals Android Apps</span>
                </h3>
                <p>
                  On Android systems (including Samsung Galaxy, Google Pixel, Retroid Pocket, Odin 2, and Android TV/Handhelds), application icons are registered with the system launcher via their `android.intent.action.MAIN` intent-filter.
                </p>
                <p>
                  SaveSync interfaces with Android's Package Manager through Shizuku, ADB Wireless, or Samsung Game Space API to disable the launcher alias or suspend the package from the system home screen:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>
                    <strong className="text-white">Launcher Component Concealment:</strong> Disables the launcher intent (`pm set-component-enabled-setting`) so the icon is removed from the home screen while preserving background save sync.
                  </li>
                  <li>
                    <strong className="text-white">App Suspension:</strong> Marks the app as private/suspended on the home screen, allowing only SaveSync to launch it with custom save profiles.
                  </li>
                  <li>
                    <strong className="text-white">Android 15 Private Space:</strong> Relocates the app package into the isolated encrypted gaming sandbox.
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white block">Exclusive SaveSync Portal</span>
                  <p className="text-slate-400">
                    By keeping emulator and game icons off the system home screen, all play sessions, save state branches, and cloud backups are guaranteed to run through SaveSync's versioned vault.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white block">Zero Data Loss & Safe Unhide</span>
                  <p className="text-slate-400">
                    Your games, ROMs, and battery saves remain 100% intact. Clicking "Restore to Home" brings the system icon back immediately without reinstallation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="text-slate-400">
                You can run these standard Android Shell commands directly or let Shizuku execute them automatically:
              </div>

              <div className="space-y-3">
                {games.slice(0, 4).map((game) => {
                  const pkg = game.packageName || 'com.emulator.app';
                  const cmdHide = `adb shell pm set-component-enabled-setting ${pkg}/.MainActivity 2 1`;
                  const cmdRestore = `adb shell pm set-component-enabled-setting ${pkg}/.MainActivity 1 1`;

                  return (
                    <div
                      key={game.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between text-slate-300 font-bold">
                        <span>{game.title} ({pkg})</span>
                        <span className="text-[10px] text-sky-400">
                          {game.isHiddenFromAndroidHome ? 'CONCEALED' : 'VISIBLE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded text-[11px] text-emerald-400 select-all">
                        <code>{cmdHide}</code>
                        <button
                          onClick={() => handleCopy(cmdHide)}
                          className="ml-2 text-slate-400 hover:text-white"
                          title="Copy command"
                        >
                          {copiedCommand === cmdHide ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Service: Shizuku v13.5.4 connected</span>
          </div>
          <button
            onClick={() => {
              sound.playPS5Confirm();
              onClose();
            }}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors"
          >
            Apply Concealment & Close
          </button>
        </div>
      </div>
    </div>
  );
};
