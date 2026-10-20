import React from 'react';
import { X, ShieldCheck, Swords, Dices, Flag, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Dices className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase text-white">
              Official Ludo Rules
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* 1. Starting */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-1.5 mb-1 text-sm text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1. Leaving the Yard (Entry)</span>
            </h3>
            <p>
              All four player pieces start in the corner yard. To bring a piece onto the active track, you must roll a <strong>6</strong> (or a 1 if configured). The piece enters on your color&apos;s starting square.
            </p>
          </div>

          {/* 2. Rolling a Six */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-1.5 mb-1 text-sm text-amber-300">
              <Dices className="w-4 h-4 text-amber-400" />
              <span>2. Rolling a Six</span>
            </h3>
            <p>
              Rolling a <strong>6</strong> grants you an immediate bonus roll! You may choose to enter a new piece from your yard or advance any piece already in play. Note: rolling three 6s in a row forfeits your turn.
            </p>
          </div>

          {/* 3. Capturing */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-1.5 mb-1 text-sm text-rose-300">
              <Swords className="w-4 h-4 text-rose-400" />
              <span>3. Capturing Opponents</span>
            </h3>
            <p>
              If your piece lands on an opponent&apos;s piece on an unprotected track square, the opponent piece is <strong>captured</strong> and sent straight back to its yard! Capturing also awards you an extra bonus roll.
            </p>
          </div>

          {/* 4. Safe Squares */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-1.5 mb-1 text-sm text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4. Safe Squares (Star & Start)</span>
            </h3>
            <p>
              Squares marked with a <strong>Star (★)</strong> and each color&apos;s colored <strong>Start Square</strong> are safe sanctuaries. Pieces resting on safe squares cannot be captured by any opponent.
            </p>
          </div>

          {/* 5. Home Lane & Winning */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-1.5 mb-1 text-sm text-indigo-300">
              <Flag className="w-4 h-4 text-indigo-400" />
              <span>5. Home Lane & Victory</span>
            </h3>
            <p>
              After completing a full circuit around the board, pieces turn into your color-matched <strong>Home Lane</strong>. Only your pieces can enter this lane. Reaching the center requires an exact dice roll. The first player to bring all 4 pieces home wins!
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
