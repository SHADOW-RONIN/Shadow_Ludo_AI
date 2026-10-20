import React from 'react';
import { GameState } from '../../types/game';
import { COLOR_CONFIG } from '../../game/boardPath';
import {
  Volume2,
  VolumeX,
  Pause,
  BookOpen,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface TurnBannerProps {
  gameState: GameState;
  onPause: () => void;
  onOpenRules: () => void;
  onToggleHints: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  gameState,
  onPause,
  onOpenRules,
  onToggleHints,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const cfg = activePlayer ? COLOR_CONFIG[activePlayer.color] : null;

  return (
    <header className="w-full flex items-center justify-between gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
      {/* Brand & Mode Tag */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs tracking-wider shadow">
          SL
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span>SHADOW LUDO</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              {gameState.mode}
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[170px] sm:max-w-xs">
            {gameState.lastActionDescription}
          </p>
        </div>
      </div>

      {/* Active Player Status Badge */}
      {activePlayer && cfg && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: cfg.hex }}
          />
          <span className="text-xs font-bold text-slate-200">
            {activePlayer.name}&apos;s Turn
          </span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Practice Hints toggle */}
        <button
          onClick={onToggleHints}
          title={gameState.hintsEnabled ? 'Disable Legal Move Hints' : 'Enable Legal Move Hints'}
          className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            gameState.hintsEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Rules button */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onOpenRules();
          }}
          title="Game Rules & Guide"
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Quick Restart */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onRestart();
          }}
          title="Restart Game"
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Pause Menu button */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onPause();
          }}
          title="Pause / Settings"
          className="px-3 py-2 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Pause className="w-4 h-4" />
          <span className="hidden sm:inline">Pause</span>
        </button>
      </div>
    </header>
  );
};
