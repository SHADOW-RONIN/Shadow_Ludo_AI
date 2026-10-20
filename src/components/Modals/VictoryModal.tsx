import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, Player } from '../../types/game';
import { COLOR_CONFIG } from '../../game/boardPath';
import { sound } from '../../utils/audio';
import { Trophy, RotateCcw, Home, Swords, Dices, Clock } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  winner: Player;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  winner,
  onPlayAgain,
  onMainMenu,
}) => {
  const cfg = COLOR_CONFIG[winner.color];

  // Fire celebratory confetti on mount and victory fanfare
  useEffect(() => {
    sound.playVictory();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [cfg.hex, '#38bdf8', '#fbbf24', '#a855f7'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [cfg.hex, '#38bdf8', '#fbbf24', '#a855f7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [cfg.hex]);

  // Calculate elapsed match duration
  const matchDurationSeconds = Math.max(
    1,
    Math.round(((gameState.endTime || Date.now()) - gameState.startTime) / 1000)
  );
  const minutes = Math.floor(matchDurationSeconds / 60);
  const seconds = matchDurationSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 text-center overflow-hidden">
        {/* Glow backdrop behind trophy */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40"
          style={{ backgroundColor: cfg.hex }}
        />

        {/* Crown & Trophy Lockup */}
        <div className="relative mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl animate-bounce"
          style={{ backgroundColor: cfg.hex, boxShadow: `0 0 35px ${cfg.hexGlow}` }}
        >
          <Trophy className="w-10 h-10 text-white fill-current" />
        </div>

        {/* Winner Announcement */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-1">
          {winner.name} Wins!
        </h2>
        <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-6">
          Victory Champion of the Board
        </p>

        {/* Match Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 mb-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time</span>
            </span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {timeFormatted}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Captures</span>
            </span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {winner.stats.captures}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Rolls</span>
            </span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {winner.stats.rollsCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playButtonClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
