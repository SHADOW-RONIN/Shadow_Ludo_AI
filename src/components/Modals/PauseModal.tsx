import React from 'react';
import { Play, RotateCcw, Home, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../utils/audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenRules: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onMainMenu,
  onOpenRules,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 text-center">
        <h3 className="text-xl font-black uppercase text-white tracking-wider mb-1">
          Game Paused
        </h3>
        <p className="text-xs text-slate-400 mb-6">Take a breather</p>

        {/* Audio Controls */}
        <div className="p-3 mb-6 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>Sound Effects</span>
            </span>
            <button
              onClick={() => {
                sound.playButtonClick();
                onToggleMute();
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
          {!isMuted && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playButtonClick();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenRules();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Rules</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              if (window.confirm('Restart this match from the beginning?')) {
                onRestart();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Match</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              if (window.confirm('Return to main menu? Current progress will be lost.')) {
                onMainMenu();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
