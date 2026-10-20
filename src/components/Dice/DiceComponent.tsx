import React, { useState, useEffect } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_CONFIG } from '../../game/boardPath';
import { sound } from '../../utils/audio';

interface DiceComponentProps {
  currentValue: number | null;
  onRoll: () => void;
  disabled: boolean;
  isRolling: boolean;
  playerColor: PlayerColor;
  bonusTurn: boolean;
  isAI: boolean;
}

export const DiceComponent: React.FC<DiceComponentProps> = ({
  currentValue,
  onRoll,
  disabled,
  isRolling,
  playerColor,
  bonusTurn,
  isAI,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(currentValue || 1);
  const cfg = COLOR_CONFIG[playerColor];

  // Cycling random faces while rolling animation is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 70);
    } else if (currentValue !== null) {
      setDisplayValue(currentValue);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRolling, currentValue]);

  const handleRollClick = () => {
    if (disabled || isRolling || isAI) return;
    sound.playDiceRoll();
    onRoll();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 3D Dice Container */}
      <div
        onClick={handleRollClick}
        role="button"
        tabIndex={disabled || isAI ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !disabled && !isAI) {
            handleRollClick();
          }
        }}
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2.5 transition-all duration-300 flex items-center justify-center select-none shadow-[0_12px_28px_rgba(0,0,0,0.6)] ${
          disabled || isAI
            ? 'opacity-85 cursor-not-allowed'
            : 'cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-white/30 hover:ring-cyan-400'
        } ${isRolling ? 'animate-bounce' : ''}`}
        style={{
          background: `linear-gradient(145deg, #1f293d, #0f172a)`,
          border: `2px solid ${cfg.hex}`,
          boxShadow: `0 0 20px ${cfg.hexGlow}`,
        }}
      >
        {/* Dice Face with Pips */}
        <div
          className={`w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-300 p-2 grid grid-cols-3 grid-rows-3 items-center justify-items-center shadow-inner transition-transform duration-150 ${
            isRolling ? 'rotate-12 scale-90' : 'rotate-0 scale-100'
          }`}
        >
          {renderPips(displayValue, cfg.hexDark)}
        </div>

        {/* 6 Rolled Crown / Star */}
        {!isRolling && currentValue === 6 && (
          <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-lg animate-bounce uppercase tracking-wider">
            ★ SIX!
          </div>
        )}
      </div>

      {/* Bonus Roll Badge */}
      {bonusTurn && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
          +1 Bonus Roll
        </span>
      )}

      {/* Roll Action Button for Human */}
      {!isAI ? (
        <button
          onClick={handleRollClick}
          disabled={disabled || isRolling}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-lg ${
            disabled || isRolling
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 active:scale-95 shadow-cyan-500/25 cursor-pointer ring-1 ring-white/20'
          }`}
        >
          <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
          <span className="text-xs opacity-75 hidden sm:inline">(Space)</span>
        </button>
      ) : (
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 py-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );

  function renderPips(value: number, pipColor: string) {
    // 3x3 grid matrix indices:
    // [0,0] [1,0] [2,0]
    // [0,1] [1,1] [2,1]
    // [0,2] [1,2] [2,2]
    const pips: React.ReactNode[] = [];

    const hasTopLeft = value === 2 || value === 3 || value === 4 || value === 5 || value === 6;
    const hasTopRight = value === 4 || value === 5 || value === 6;
    const hasMidLeft = value === 6;
    const hasCenter = value === 1 || value === 3 || value === 5;
    const hasMidRight = value === 6;
    const hasBottomLeft = value === 4 || value === 5 || value === 6;
    const hasBottomRight = value === 2 || value === 3 || value === 4 || value === 5 || value === 6;

    const makePip = (visible: boolean, key: string) => (
      <div
        key={key}
        className={`w-3.5 h-3.5 rounded-full transition-opacity ${
          visible ? 'opacity-100 shadow-sm' : 'opacity-0'
        }`}
        style={{
          background: visible ? pipColor : 'transparent',
        }}
      />
    );

    pips.push(makePip(hasTopLeft, 'tl'));
    pips.push(makePip(false, 'tc'));
    pips.push(makePip(hasTopRight, 'tr'));

    pips.push(makePip(hasMidLeft, 'ml'));
    pips.push(makePip(hasCenter, 'mc'));
    pips.push(makePip(hasMidRight, 'mr'));

    pips.push(makePip(hasBottomLeft, 'bl'));
    pips.push(makePip(false, 'bc'));
    pips.push(makePip(hasBottomRight, 'br'));

    return pips;
  }
};
